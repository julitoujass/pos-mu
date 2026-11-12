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

import { processSale } from './api'

const fetchMock = vi.fn()

beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
    vi.unstubAllGlobals()
})

describe('processSale', () => {
    it('sends the Idempotency-Key header and a body without prices', async () => {
        fetchMock.mockResolvedValue(
            jsonResponse({ id: 's1', total: 100, metodo_pago: 'Efectivo', created_at: 'now' }),
        )

        const res = await processSale(
            {
                cliente_id: null,
                metodo_pago: 'Efectivo',
                items: [{ variante_id: 'v1', cantidad: 2 }],
            },
            'key-123',
        )

        expect(res.total).toBe(100)
        const [url, init] = fetchMock.mock.calls[0]
        expect(url).toBe('/api/python/ventas/')
        expect(init.method).toBe('POST')
        expect(init.headers['Idempotency-Key']).toBe('key-123')
        expect(init.headers['Authorization']).toBe('Bearer test-token')
        const body = JSON.parse(init.body)
        expect(body).toEqual({
            cliente_id: null,
            metodo_pago: 'Efectivo',
            items: [{ variante_id: 'v1', cantidad: 2 }],
        })
        expect(init.body).not.toContain('precio')
        expect(init.body).not.toContain('total')
    })

    it('throws the backend detail on error', async () => {
        fetchMock.mockResolvedValue(jsonResponse({ detail: 'Stock insuficiente' }, 409))
        await expect(
            processSale({ metodo_pago: 'QR', items: [{ variante_id: 'v1', cantidad: 1 }] }, 'k'),
        ).rejects.toThrow('Stock insuficiente')
    })

    it('uses the first message of a 422 array detail', async () => {
        fetchMock.mockResolvedValue(
            jsonResponse({ detail: [{ msg: 'Field required', loc: ['body', 'items'] }] }, 422),
        )
        await expect(
            processSale({ metodo_pago: 'QR', items: [] }, 'k'),
        ).rejects.toThrow('Field required')
    })
})
