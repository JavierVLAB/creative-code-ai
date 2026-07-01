// Hook de comunicación con el backend Mastra del agente.

import { useCallback, useState } from 'react'

import { AgentResponseError, parseAgentResponse } from '../lib/agent'
import { useSession } from './useSession'

import type { AgentRequest, AgentResponse } from '../lib/types'
import type { Session } from '@supabase/supabase-js'

const REQUEST_TIMEOUT_MS = 60000
const ERROR_NO_SESSION = 'Necesitas iniciar sesión para hablar con el agente.'
const ERROR_NETWORK = 'No pude conectar con el agente, inténtalo de nuevo.'
const ERROR_BAD_REQUEST = 'El agente no pudo procesar el contexto actual del sketch.'
const ERROR_UNAUTHORIZED = 'Tu sesión caducó. Vuelve a iniciar sesión.'

interface UseAgentReturn {
  sendMessage: (request: AgentRequest) => Promise<AgentResponse>
  loading: boolean
  error: string | null
}

function getApiUrl() {
  return import.meta.env.VITE_API_URL ?? import.meta.env.VITE_BACKEND_URL ?? ''
}

function friendlyHttpError(status: number) {
  if (status === 401) return ERROR_UNAUTHORIZED
  if (status === 400) return ERROR_BAD_REQUEST
  return ERROR_NETWORK
}

function isExpectedAgentError(error: Error) {
  return error instanceof AgentResponseError
    || error.message === ERROR_NO_SESSION
    || error.message === ERROR_BAD_REQUEST
    || error.message === ERROR_UNAUTHORIZED
    || error.message.startsWith('Falta VITE_API_URL')
}

/** Llama a POST /agent con token Bearer y valida la respuesta estructurada. */
export async function sendAgentMessage(request: AgentRequest, session: Session | null): Promise<AgentResponse> {
  if (!session) throw new Error(ERROR_NO_SESSION)

  const apiUrl = getApiUrl()
  if (!apiUrl) throw new Error('Falta VITE_API_URL en front/.env.')

  const controller = new AbortController()
  const timeout = globalThis.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(`${apiUrl.replace(/\/$/, '')}/agent`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new Error(friendlyHttpError(response.status))
    }

    return parseAgentResponse(await response.json())
  } catch (error) {
    if (error instanceof Error && isExpectedAgentError(error)) throw error
    throw new Error(ERROR_NETWORK)
  } finally {
    globalThis.clearTimeout(timeout)
  }
}

/** Expone estado de carga/error para enviar instrucciones al agente. */
export function useAgent(): UseAgentReturn {
  const { session } = useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = useCallback(async (request: AgentRequest) => {
    setLoading(true)
    setError(null)

    try {
      return await sendAgentMessage(request, session)
    } catch (err) {
      const message = err instanceof Error ? err.message : ERROR_NETWORK
      setError(message)
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }, [session])

  return { sendMessage, loading, error }
}
