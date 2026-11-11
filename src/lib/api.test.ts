import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('./supabase/client', () => ({
    createClient: () => ({
        auth: {
            getSession: async () => ({
                data: { session: { access_token: 'test-token' } },
                error: null,
            }),
        },
    }),
}))

import {
    closeRegister,
    fetchCashSummary,
    openRegister,
    processSale,
    type CashSummary,
} from './api'

function jsonResponse(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
    })
}

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

describe('fetchCashSummary', () => {
    it('returns null when there is no open session', async () => {
        fetchMock.mockResolvedValue(jsonResponse(null))
        await expect(fetchCashSummary()).resolves.toBeNull()
        expect(fetchMock.mock.calls[0][0]).toBe('/api/python/caja/resumen')
    })

    it('returns the summary object', async () => {
        const summary: CashSummary = {
            sesion_id: 's1',
            estado: 'abierta',
            fecha_apertura: 'now',
            monto_apertura: 100,
            ventas_efectivo: 50,
            ventas_tarjeta: 20,
            ventas_qr: 10,
            cantidad_ventas: 3,
            ingresos: 5,
            egresos: 2,
            esperado_efectivo: 153,
        }
        fetchMock.mockResolvedValue(jsonResponse(summary))
        await expect(fetchCashSummary()).resolves.toEqual(summary)
    })

    it('throws on a failed response', async () => {
        fetchMock.mockResolvedValue(jsonResponse({ detail: 'boom' }, 500))
        await expect(fetchCashSummary()).rejects.toThrow('boom')
    })
})

describe('openRegister / closeRegister', () => {
    it('opens the register sending only monto_apertura', async () => {
        fetchMock.mockResolvedValue(jsonResponse({ id: 'c1', estado: 'abierta' }))
        await openRegister({ monto_apertura: 500 })
        const [, init] = fetchMock.mock.calls[0]
        expect(JSON.parse(init.body)).toEqual({ monto_apertura: 500 })
        expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it('closes the register and returns the closed session', async () => {
        fetchMock.mockResolvedValue(jsonResponse({ id: 'c1', estado: 'cerrada' }))
        const res = await closeRegister({ monto_real_efectivo: 10 })
        expect(res.estado).toBe('cerrada')
    })
})
