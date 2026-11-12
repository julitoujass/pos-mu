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

import { ApiError } from '@/lib/http'
import { fetchMe } from './api'

const fetchMock = vi.fn()

beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
    vi.unstubAllGlobals()
})

describe('fetchMe', () => {
    it('reads /usuarios/me with the bearer token and without caching', async () => {
        fetchMock.mockResolvedValue(jsonResponse({ id: 'u1', email: 'a@b.c', rol: 'admin' }))
        await expect(fetchMe()).resolves.toEqual({ id: 'u1', email: 'a@b.c', rol: 'admin' })
        const [url, init] = fetchMock.mock.calls[0]
        expect(url).toBe('/api/python/usuarios/me')
        expect(init.headers['Authorization']).toBe('Bearer test-token')
        expect(init.cache).toBe('no-store')
        expect(init.method).toBeUndefined()
    })

    it('throws an ApiError carrying the HTTP status', async () => {
        fetchMock.mockResolvedValue(jsonResponse({ detail: 'Usuario inactivo' }, 403))
        const err = await fetchMe().catch((e: unknown) => e)
        expect(err).toBeInstanceOf(ApiError)
        expect((err as ApiError).status).toBe(403)
        expect((err as ApiError).message).toBe('Usuario inactivo')
    })
})
