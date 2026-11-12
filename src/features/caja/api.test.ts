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

import { closeRegister, fetchCashSummary, openRegister } from './api'
import type { CashSummary } from './types'

const fetchMock = vi.fn()

beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
    vi.unstubAllGlobals()
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
        const [url, init] = fetchMock.mock.calls[0]
        expect(url).toBe('/api/python/caja/apertura')
        expect(init.method).toBe('POST')
        expect(JSON.parse(init.body)).toEqual({ monto_apertura: 500 })
        expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it('closes the register and returns the closed session', async () => {
        fetchMock.mockResolvedValue(jsonResponse({ id: 'c1', estado: 'cerrada' }))
        const res = await closeRegister({ monto_real_efectivo: 10 })
        expect(res.estado).toBe('cerrada')
    })
})
