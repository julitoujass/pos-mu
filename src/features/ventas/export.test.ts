import { describe, expect, it, vi } from 'vitest'
import { toCsv } from '@/lib/csv'
import { SALES_CSV_COLUMNS, SALES_EXPORT_PAGE_SIZE, fetchAllSales } from './export'
import type { SaleListItem, SalesPage } from './types'

function sale(id: string, extra: Partial<SaleListItem> = {}): SaleListItem {
    return {
        id,
        created_at: '2026-01-02T15:30:00Z',
        subtotal: 1000,
        descuento_aplicado: 100,
        recargo_aplicado: 0,
        total: 900.5,
        metodo_pago: 'Efectivo',
        estado: 'completada',
        cliente: { id: 'c1', nombre: 'Ana' },
        usuario: { id: 'u1', nombre: 'Luis' },
        ...extra,
    }
}

describe('fetchAllSales', () => {
    it('pages through every result with the export page size', async () => {
        const all = Array.from({ length: 450 }, (_, i) => sale(`s${i}`))
        const fetcher = vi.fn(async (filters: { limit?: number; offset?: number }): Promise<SalesPage> => ({
            items: all.slice(filters.offset ?? 0, (filters.offset ?? 0) + (filters.limit ?? 0)),
            total: all.length,
        }))

        const result = await fetchAllSales({ desde: '2026-01-01' }, fetcher)

        expect(result).toHaveLength(450)
        expect(fetcher).toHaveBeenCalledTimes(3)
        expect(fetcher.mock.calls.map(c => c[0].offset)).toEqual([0, 200, 400])
        expect(fetcher.mock.calls[0][0]).toMatchObject({ desde: '2026-01-01', limit: SALES_EXPORT_PAGE_SIZE })
    })

    it('stops on an empty page even if total is inconsistent', async () => {
        const fetcher = vi.fn(async (): Promise<SalesPage> => ({ items: [], total: 10 }))
        expect(await fetchAllSales({}, fetcher)).toEqual([])
        expect(fetcher).toHaveBeenCalledTimes(1)
    })
})

describe('SALES_CSV_COLUMNS', () => {
    it('serializes a sale with es-AR numbers and a fallback for the client', () => {
        const csv = toCsv([sale('s1', { cliente: null, total_devuelto: 50 })], SALES_CSV_COLUMNS)
        const [header, row] = csv.replace('﻿', '').split('\r\n')
        expect(header).toBe('Fecha;Cliente;Vendedor;Método;Subtotal;Descuento;Recargo;Total;Devuelto;Estado')
        expect(row).toContain(';Consumidor Final;Luis;Efectivo;1000;100;0;900,5;50;completada')
    })
})
