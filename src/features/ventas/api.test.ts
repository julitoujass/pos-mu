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

import { cancelSale, createReturn, fetchSaleDetail, fetchSales, processSale } from './api'

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

describe('processSale with discount and surcharge', () => {
    it('sends descuento and recargo only when provided', async () => {
        fetchMock.mockResolvedValue(jsonResponse({ id: 's1', total: 95, metodo_pago: 'QR', created_at: 'now' }))
        await processSale(
            {
                metodo_pago: 'QR',
                items: [{ variante_id: 'v1', cantidad: 1 }],
                descuento: { tipo: 'porcentaje', valor: 10 },
                recargo: { tipo: 'monto', valor: 5 },
            },
            'k',
        )
        const body = JSON.parse(fetchMock.mock.calls[0][1].body)
        expect(body.descuento).toEqual({ tipo: 'porcentaje', valor: 10 })
        expect(body.recargo).toEqual({ tipo: 'monto', valor: 5 })
    })

    it('throws the 403 detail for an employee discount over the limit', async () => {
        fetchMock.mockResolvedValue(
            jsonResponse({ detail: 'El descuento máximo permitido para empleados es 10%' }, 403),
        )
        await expect(
            processSale({ metodo_pago: 'QR', items: [], descuento: { tipo: 'porcentaje', valor: 50 } }, 'k'),
        ).rejects.toThrow('El descuento máximo permitido para empleados es 10%')
    })
})

describe('fetchSales', () => {
    it('builds the query string skipping empty filters', async () => {
        fetchMock.mockResolvedValue(jsonResponse({ items: [], total: 0 }))
        const page = await fetchSales({
            desde: '2026-01-01',
            hasta: '2026-01-31',
            metodo_pago: 'QR',
            estado: undefined,
            limit: 50,
            offset: 0,
        })
        expect(page.total).toBe(0)
        const [url, init] = fetchMock.mock.calls[0]
        expect(url).toBe('/api/python/ventas/?desde=2026-01-01&hasta=2026-01-31&metodo_pago=QR&limit=50&offset=0')
        expect(init.headers['Authorization']).toBe('Bearer test-token')
    })

    it('requests the bare list without filters', async () => {
        fetchMock.mockResolvedValue(jsonResponse({ items: [], total: 0 }))
        await fetchSales()
        expect(fetchMock.mock.calls[0][0]).toBe('/api/python/ventas/')
    })

    it('throws the backend detail on error', async () => {
        fetchMock.mockResolvedValue(jsonResponse({ detail: 'Nope' }, 403))
        await expect(fetchSales()).rejects.toThrow('Nope')
    })
})

describe('fetchSaleDetail', () => {
    it('gets a sale by id', async () => {
        fetchMock.mockResolvedValue(jsonResponse({ id: 's1', items: [] }))
        const sale = await fetchSaleDetail('s1')
        expect(sale.id).toBe('s1')
        expect(fetchMock.mock.calls[0][0]).toBe('/api/python/ventas/s1')
    })
})

describe('cancelSale', () => {
    it('posts the motivo to the anular endpoint', async () => {
        fetchMock.mockResolvedValue(jsonResponse({ id: 's1', estado: 'anulada', items: [] }))
        await cancelSale('s1', 'Error de carga')
        const [url, init] = fetchMock.mock.calls[0]
        expect(url).toBe('/api/python/ventas/s1/anular')
        expect(init.method).toBe('POST')
        expect(JSON.parse(init.body)).toEqual({ motivo: 'Error de carga' })
    })

    it('throws the backend detail (409 already cancelled)', async () => {
        fetchMock.mockResolvedValue(jsonResponse({ detail: 'La venta ya está anulada' }, 409))
        await expect(cancelSale('s1', 'x')).rejects.toThrow('La venta ya está anulada')
    })
})

describe('createReturn', () => {
    it('posts motivo and items to the devoluciones endpoint', async () => {
        fetchMock.mockResolvedValue(jsonResponse({ id: 's1', devoluciones: [], items: [] }))
        await createReturn('s1', { motivo: 'Talle chico', items: [{ variante_id: 'v1', cantidad: 1 }] })
        const [url, init] = fetchMock.mock.calls[0]
        expect(url).toBe('/api/python/ventas/s1/devoluciones')
        expect(init.method).toBe('POST')
        expect(JSON.parse(init.body)).toEqual({
            motivo: 'Talle chico',
            items: [{ variante_id: 'v1', cantidad: 1 }],
        })
    })

    it('throws the backend detail (400 without open register)', async () => {
        fetchMock.mockResolvedValue(
            jsonResponse({ detail: 'Abrí la caja para registrar la devolución en efectivo' }, 400),
        )
        await expect(createReturn('s1', { motivo: 'x', items: [] })).rejects.toThrow('Abrí la caja')
    })
})
