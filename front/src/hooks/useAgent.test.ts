import { afterEach, describe, expect, it, vi } from 'vitest'

import { sendAgentMessage } from './useAgent'

import type { Session } from '@supabase/supabase-js'

const SESSION = {
  access_token: 'token-test',
} as Session

const REQUEST = {
  projectId: '00000000-0000-4000-8000-000000000000',
  message: 'Hazlo más grande',
  sketchJs: 'function setup() {}',
  configYaml: 'name: test',
  renderer: 'p5js' as const,
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('sendAgentMessage', () => {
  it('envía POST /agent con Bearer token y body completo', async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ response: 'Listo' }), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    const result = await sendAgentMessage(REQUEST, SESSION)
    const [url, init] = fetchMock.mock.calls[0]
    const requestInit = init as RequestInit

    expect(String(url)).toMatch(/\/agent$/)
    expect(requestInit.method).toBe('POST')
    expect(requestInit.headers).toMatchObject({ Authorization: 'Bearer token-test' })
    expect(JSON.parse(String(requestInit.body))).toMatchObject(REQUEST)
    expect(result.response).toBe('Listo')
  })

  it('devuelve error amable si falta sesión', async () => {
    await expect(sendAgentMessage(REQUEST, null)).rejects.toThrow(/iniciar sesión/)
  })

  it('devuelve error amable para 401', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })))

    await expect(sendAgentMessage(REQUEST, SESSION)).rejects.toThrow(/sesión caducó/)
  })

  it('devuelve error amable si falla la red', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => {
      throw new Error('network down')
    }))

    await expect(sendAgentMessage(REQUEST, SESSION)).rejects.toThrow(/No pude conectar/)
  })

  it('devuelve error si la respuesta no tiene response', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ ok: true }), { status: 200 })))

    await expect(sendAgentMessage(REQUEST, SESSION)).rejects.toThrow(/incompleta/)
  })
})
