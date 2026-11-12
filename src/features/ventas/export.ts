import type { CsvColumn } from '@/lib/csv'
import { fetchSales } from './api'
import type { SaleListItem, SalesFilters, SalesPage } from './types'

export const SALES_EXPORT_PAGE_SIZE = 200

type SalesFetcher = (filters: SalesFilters) => Promise<SalesPage>

/** Fetches every page of sales for the given filters (200 per request). */
export async function fetchAllSales(
    filters: SalesFilters,
    fetcher: SalesFetcher = fetchSales,
): Promise<SaleListItem[]> {
    const all: SaleListItem[] = []
    for (let offset = 0; ; offset += SALES_EXPORT_PAGE_SIZE) {
        const page = await fetcher({ ...filters, limit: SALES_EXPORT_PAGE_SIZE, offset })
        all.push(...page.items)
        if (page.items.length === 0 || all.length >= page.total) break
    }
    return all
}

export const SALES_CSV_COLUMNS: CsvColumn<SaleListItem>[] = [
    { header: 'Fecha', value: s => new Date(s.created_at).toLocaleString('es-AR') },
    { header: 'Cliente', value: s => s.cliente?.nombre ?? 'Consumidor Final' },
    { header: 'Vendedor', value: s => s.usuario?.nombre ?? '' },
    { header: 'Método', value: s => s.metodo_pago },
    { header: 'Subtotal', value: s => s.subtotal },
    { header: 'Descuento', value: s => s.descuento_aplicado },
    { header: 'Recargo', value: s => s.recargo_aplicado },
    { header: 'Total', value: s => s.total },
    { header: 'Devuelto', value: s => s.total_devuelto ?? 0 },
    { header: 'Estado', value: s => s.estado },
]
