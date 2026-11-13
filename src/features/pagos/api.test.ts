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

import {
    cancelPayment,
    disconnectClover,
    fetchCloverAuthorizeUrl,
    fetchPayment,
    fetchPayments,
    fetchTerminalStatus,
    reconcilePayment,
    startTerminalPayment,
    updateTerminalSettings,
} from './api'

const fetchMock = vi.fn()

beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
    vi.unstubAllGlobals()
})

describe('fetchTerminalStatus', () => {
    it('gets /integraciones/terminal', async () => {
        fetchMock.mockResolvedValue(jsonResponse({ proveedor: 'fake', habilitado: true, conectado: true }))
        const status = await fetchTerminalStatus()
        expect(status.habilitado).toBe(true)
        expect(fetchMock.mock.calls[0][0]).toBe('/api/python/integraciones/terminal')
    })
})

describe('updateTerminalSettings', () => {
    it('PATCHes only the given fields', async () => {
        fetchMock.mockResolvedValue(jsonResponse({ proveedor: 'fake', habilitado: true, conectado: true }))
        await updateTerminalSettings({ habilitado: true })
        const [url, init] = fetchMock.mock.calls[0]
        expect(url).toBe('/api/python/integraciones/terminal')
        expect(init.method).toBe('PATCH')
        expect(JSON.parse(init.body)).toEqual({ habilitado: true })
    })
})

describe('startTerminalPayment', () => {
    it('POSTs the sale data to /pagos/terminal', async () => {
        fetchMock.mockResolvedValue(jsonResponse({ pago_id: 'p1', total: 1500, estado: 'pendiente' }, 202))
        const data = { metodo_pago: 'Tarjeta' as const, items: [{ variante_id: 'v1', cantidad: 2 }], cliente_id: null }
        const result = await startTerminalPayment(data)
        expect(result.pago_id).toBe('p1')
        const [url, init] = fetchMock.mock.calls[0]
        expect(url).toBe('/api/python/pagos/terminal')
        expect(init.method).toBe('POST')
        expect(JSON.parse(init.body)).toEqual(data)
    })

    it('throws the backend detail when another charge is in progress', async () => {
        fetchMock.mockResolvedValue(jsonResponse({ detail: 'Ya hay un cobro en curso' }, 409))
        await expect(startTerminalPayment({ metodo_pago: 'QR', items: [] })).rejects.toThrow('Ya hay un cobro en curso')
    })
})

describe('fetchPayment / cancelPayment', () => {
    it('gets /pagos/{id}', async () => {
        fetchMock.mockResolvedValue(jsonResponse({ id: 'p1', estado: 'enviado' }))
        await fetchPayment('p1')
        expect(fetchMock.mock.calls[0][0]).toBe('/api/python/pagos/p1')
    })

    it('POSTs /pagos/{id}/cancelar', async () => {
        fetchMock.mockResolvedValue(jsonResponse({ id: 'p1', estado: 'enviado' }))
        await cancelPayment('p1')
        const [url, init] = fetchMock.mock.calls[0]
        expect(url).toBe('/api/python/pagos/p1/cancelar')
        expect(init.method).toBe('POST')
    })
})

describe('fetchPayments', () => {
    it('sends the state filter and pagination', async () => {
        fetchMock.mockResolvedValue(jsonResponse({ items: [], total: 0 }))
        await fetchPayments({ estado: 'indeterminado', limit: 50, offset: 100 })
        expect(fetchMock.mock.calls[0][0]).toBe('/api/python/pagos/?estado=indeterminado&limit=50&offset=100')
    })

    it('skips empty filters', async () => {
        fetchMock.mockResolvedValue(jsonResponse({ items: [], total: 0 }))
        await fetchPayments()
        expect(fetchMock.mock.calls[0][0]).toBe('/api/python/pagos/')
    })
})

describe('reconcilePayment', () => {
    it('POSTs /pagos/{id}/conciliar', async () => {
        fetchMock.mockResolvedValue(jsonResponse({ id: 'p1', estado: 'venta_registrada' }))
        const pago = await reconcilePayment('p1')
        expect(pago.estado).toBe('venta_registrada')
        const [url, init] = fetchMock.mock.calls[0]
        expect(url).toBe('/api/python/pagos/p1/conciliar')
        expect(init.method).toBe('POST')
    })
})

describe('fetchCloverAuthorizeUrl', () => {
    it('gets the authorize url', async () => {
        fetchMock.mockResolvedValue(jsonResponse({ authorize_url: 'https://clover.test/oauth' }))
        const url = await fetchCloverAuthorizeUrl()
        expect(url).toBe('https://clover.test/oauth')
        expect(fetchMock.mock.calls[0][0]).toBe('/api/python/integraciones/clover/conectar')
    })
})

describe('disconnectClover', () => {
    it('POSTs to /integraciones/clover/desconectar', async () => {
        fetchMock.mockResolvedValue(jsonResponse({ proveedor: 'clover', habilitado: false, conectado: false, conectado_oauth: false }))
        const status = await disconnectClover()
        const [url, init] = fetchMock.mock.calls[0]
        expect(url).toBe('/api/python/integraciones/clover/desconectar')
        expect(init.method).toBe('POST')
        expect(status.conectado_oauth).toBe(false)
    })
})
