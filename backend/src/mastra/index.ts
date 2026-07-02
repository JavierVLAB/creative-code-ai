// Configura la instancia principal de Mastra y separa la observabilidad local
// del storage operativo para poder revisar trazas en Studio sin tocar el contrato del backend.
import { Mastra } from '@mastra/core'
import { Observability } from '@mastra/observability'
import { PostgresStoreVNext } from '@mastra/pg'
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

const primaryDatabaseUrl = process.env.DATABASE_URL!
const observabilityDatabaseUrl = process.env.OBSERVABILITY_DATABASE_URL ?? primaryDatabaseUrl
const observabilitySchema = process.env.OBSERVABILITY_SCHEMA ?? 'mastra_observability'

export const mastra = new Mastra({
  agents: {
    'sketch-agent': createSketchAgent(),
  },
  workflows: {
    'agent-guardrails': createAgentGuardrailsWorkflow(),
  },
  observability: new Observability({
    default: {
      enabled: true,
    },
  }),
  storage: new PostgresStoreVNext({
    id: 'mastra-storage',
    connectionString: primaryDatabaseUrl,
    observability: {
      connectionString: observabilityDatabaseUrl,
      schemaName: observabilitySchema,
    },
  }),
  server: {
    // Sin auth a nivel de servidor: el Studio queda abierto en local (correcto para dev).
    // La verificación del JWT de Supabase se hace manualmente en el handler de /agent.
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
