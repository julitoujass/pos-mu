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

import { fetchLowStock, fetchProducts, fetchVariantMovements, setProductCategories } from './api'

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

describe('fetchLowStock', () => {
    it('gets the low stock list', async () => {
        fetchMock.mockResolvedValue(jsonResponse({ items: [{ variante_id: 'v1' }], total: 1 }))
        const res = await fetchLowStock()
        expect(res.total).toBe(1)
        expect(fetchMock.mock.calls[0][0]).toBe('/api/python/productos/stock-bajo')
    })

    it('throws the backend detail on error', async () => {
        fetchMock.mockResolvedValue(jsonResponse({ detail: 'Nope' }, 500))
        await expect(fetchLowStock()).rejects.toThrow('Nope')
    })
})

describe('setProductCategories', () => {
    it('PUTs the category ids', async () => {
        fetchMock.mockResolvedValue(jsonResponse({ id: 'p1', categorias: [{ id: 1, nombre: 'Camisas' }], variantes: [] }))
        const res = await setProductCategories('p1', [1, 2])
        expect(res.categorias).toHaveLength(1)
        const [url, init] = fetchMock.mock.calls[0]
        expect(url).toBe('/api/python/productos/p1/categorias')
        expect(init.method).toBe('PUT')
        expect(JSON.parse(init.body)).toEqual({ categoria_ids: [1, 2] })
    })
})

describe('fetchProducts', () => {
    it('filters by category', async () => {
        fetchMock.mockResolvedValue(jsonResponse([]))
        await fetchProducts(3)
        expect(fetchMock.mock.calls[0][0]).toBe('/api/python/productos/?categoria_id=3')
    })
})
