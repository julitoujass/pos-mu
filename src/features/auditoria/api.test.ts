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

import { fetchAuditLog } from './api'

const fetchMock = vi.fn()

beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
    vi.unstubAllGlobals()
})

describe('fetchAuditLog', () => {
    it('builds the query string skipping empty filters', async () => {
        fetchMock.mockResolvedValue(jsonResponse({ items: [], total: 0 }))
        await fetchAuditLog({ desde: '2026-01-01', hasta: '', evento: 'venta', entidad: undefined, limit: 50, offset: 100 })
        expect(fetchMock.mock.calls[0][0]).toBe('/api/python/auditoria/?desde=2026-01-01&evento=venta&limit=50&offset=100')
    })

    it('requests the bare list without filters', async () => {
        fetchMock.mockResolvedValue(jsonResponse({ items: [], total: 0 }))
        await fetchAuditLog()
        expect(fetchMock.mock.calls[0][0]).toBe('/api/python/auditoria/')
    })

    it('throws the backend detail on 403', async () => {
        fetchMock.mockResolvedValue(jsonResponse({ detail: 'Solo administradores' }, 403))
        await expect(fetchAuditLog()).rejects.toThrow('Solo administradores')
    })
})
