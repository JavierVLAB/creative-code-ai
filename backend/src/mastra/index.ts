// Configura la instancia principal de Mastra. La observabilidad se activa solo en
// desarrollo local y el storage usa SQLite local: así en Mastra Cloud no se mantienen
// conexiones persistentes a Postgres externo que impedían al servicio hibernar en idle.
import { Mastra } from '@mastra/core'
import { Observability } from '@mastra/observability'
import { LibSQLStore } from '@mastra/libsql'
import { z } from 'zod'
import { createSketchAgent } from './agents/sketch-agent.js'
import { createAgentGuardrailsWorkflow, agentOutputSchema } from './workflows/agent-guardrails.js'
import { createAdminSupabase } from '../lib/supabase.js'

const requestBodySchema = z.object({
  projectId: z.string().uuid(),
  message: z.string().min(1),
  sketchJs: z.string(),
  configYaml: z.string(),
  renderer: z.enum(['p5js', 'threejs']),
  previousResponse: z.string().optional(),
})

// La observabilidad solo se activa en desarrollo local (ENABLE_OBSERVABILITY=true).
// En Mastra Cloud no se define esta variable, así no se escriben trazas ni se mantienen
// procesos de fondo que impidan la hibernación del servicio. Ver spec agent-local-observability.
const enableObservability = process.env.ENABLE_OBSERVABILITY === 'true'

// Orígenes permitidos para CORS. En producción se restringe al dominio del frontend
// (FRONTEND_ORIGIN, definido en Mastra Cloud) más Vite en local. En dev, sin esa variable,
// se deja el default permisivo para no romper el playground/Studio.
const corsOrigin = process.env.FRONTEND_ORIGIN
  ? [process.env.FRONTEND_ORIGIN, 'http://localhost:5173']
  : '*'

export const mastra = new Mastra({
  agents: {
    'sketch-agent': createSketchAgent(),
  },
  workflows: {
    'agent-guardrails': createAgentGuardrailsWorkflow(),
  },
  // Observabilidad solo en local; en cloud se omite para permitir la hibernación en idle.
  ...(enableObservability
    ? { observability: new Observability({ default: { enabled: true } }) }
    : {}),
  // Storage local (SQLite). En Mastra Cloud la plataforma gestiona su propio storage;
  // aquí se evita la conexión persistente a Postgres externo (Supabase) que impedía hibernar.
  // La memoria conversacional del agente pasa a ser efímera/gestionada por la plataforma en cloud.
  storage: new LibSQLStore({
    id: 'curateartai-local',
    url: 'file:./mastra.db',
  }),
  server: {
    // Sin auth a nivel de servidor: el Studio queda abierto en local (correcto para dev).
    // La verificación del JWT de Supabase se hace manualmente en el handler de /agent.
    cors: {
      origin: corsOrigin,
    },
    apiRoutes: [
      {
        path: '/agent',
        method: 'POST',
        // Auth manual para poder extraer user_id y pasarlo al agente
        requiresAuth: false,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        handler: async (c: any) => {
          // Verificar Bearer token y extraer user
          const authHeader = c.req.header('Authorization')
          const token = authHeader?.replace('Bearer ', '')
          if (!token) {
            return c.json({ error: 'Unauthorized' }, 401)
          }

          const supabase = createAdminSupabase()
          const {
            data: { user },
            error: authError,
          } = await supabase.auth.getUser(token)
          if (authError || !user) {
            return c.json({ error: 'Unauthorized' }, 401)
          }

          // Validar body
          let body: unknown
          try {
            body = await c.req.json()
          } catch {
            return c.json({ error: 'Bad Request', details: 'invalid JSON body' }, 400)
          }

          const parsed = requestBodySchema.safeParse(body)
          if (!parsed.success) {
            const missing = parsed.error.errors[0]?.path.join('.') ?? 'unknown field'
            return c.json({ error: 'Bad Request', details: missing }, 400)
          }

          const { projectId, message, sketchJs, configYaml, renderer, previousResponse } = parsed.data

          try {
            const workflow = mastra.getWorkflow('agent-guardrails')
            const run = await workflow.createRun()
            const result = await run.start({
              inputData: {
                message,
                sketchJs,
                configYaml,
                renderer,
                threadId: projectId,
                resourceId: user.id,
                previousResponse,
              },
            })

            if (result.status === 'success') {
              // result.result contiene el outputSchema del workflow
              const output = result.result as z.infer<typeof agentOutputSchema>
              return c.json(output)
            } else {
              // En error, devolver mensaje en response para no crashear el cliente
              const errMsg =
                result.status === 'failed'
                  ? (result.error?.message ?? 'Error interno del agente')
                  : 'El agente no completó la ejecución'
              return c.json({ response: errMsg })
            }
          } catch (err) {
            const msg = err instanceof Error ? err.message : 'Error interno'
            return c.json({ response: msg })
          }
        },
      },
    ],
  },
})
