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

import { fetchVariantMovements } from './api'

const fetchMock = vi.fn()

beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
    vi.unstubAllGlobals()
})

describe('fetchVariantMovements', () => {
    it('requests the kardex with default pagination', async () => {
        fetchMock.mockResolvedValue(jsonResponse({ items: [], total: 0 }))
        const page = await fetchVariantMovements('v1')
        expect(page).toEqual({ items: [], total: 0 })
        expect(fetchMock.mock.calls[0][0]).toBe('/api/python/productos/variante/v1/movimientos?limit=50&offset=0')
    })

    it('passes custom limit and offset', async () => {
        fetchMock.mockResolvedValue(jsonResponse({ items: [], total: 0 }))
        await fetchVariantMovements('v1', { limit: 10, offset: 20 })
        expect(fetchMock.mock.calls[0][0]).toBe('/api/python/productos/variante/v1/movimientos?limit=10&offset=20')
    })

    it('throws the backend detail on 403', async () => {
        fetchMock.mockResolvedValue(jsonResponse({ detail: 'Sin permiso' }, 403))
        await expect(fetchVariantMovements('v1')).rejects.toThrow('Sin permiso')
    })
})
