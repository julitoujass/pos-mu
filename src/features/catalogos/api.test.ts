import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { jsonResponse } from '@/test/json-response'

vi.mock('@/lib/supabase/client', () => ({
    createClient: () => ({
        auth: {
            getSession: async () => ({
                data: { session: { access_token: 'test-token' } },
                error: null,
            }),
        },
    }),
}))

import { deleteMarca, fetchMarcas } from './api'

const fetchMock = vi.fn()

beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
    vi.unstubAllGlobals()
})

describe('fetchMarcas error handling', () => {
    it('surfaces the backend detail of a 403 on a read endpoint', async () => {
        fetchMock.mockResolvedValue(jsonResponse({ detail: 'No tenés permisos' }, 403))
        await expect(fetchMarcas()).rejects.toThrow('No tenés permisos')
    })

    it('falls back to the default message when the body has no detail', async () => {
        fetchMock.mockResolvedValue(new Response('boom', { status: 500 }))
        await expect(fetchMarcas()).rejects.toThrow('Error al cargar marcas')
    })
})

describe('deleteMarca', () => {
    it('sends a DELETE without a body and resolves to undefined', async () => {
        fetchMock.mockResolvedValue(new Response(null, { status: 204 }))
        await expect(deleteMarca(7)).resolves.toBeUndefined()
        const [url, init] = fetchMock.mock.calls[0]
        expect(url).toBe('/api/python/catalogos/marcas/7')
        expect(init.method).toBe('DELETE')
        expect(init.body).toBeUndefined()
    })
})
