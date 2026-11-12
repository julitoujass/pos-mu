import { apiJson, toQueryString } from '@/lib/http';
import type { SaleCreate, SaleDetail, SaleResponse, SalesFilters, SalesPage } from './types';

export function fetchSalesToday(): Promise<SaleResponse[]> {
    return apiJson('/ventas/hoy', 'Failed to fetch sales');
}

/**
 * Registers a sale. The idempotency key makes retries safe: the same key
 * returns the same sale instead of creating a duplicate.
 */
export function processSale(data: SaleCreate, idempotencyKey: string): Promise<SaleResponse> {
    return apiJson('/ventas/', 'Failed to process sale', {
        method: 'POST',
        headers: { 'Idempotency-Key': idempotencyKey },
        body: data,
    });
}

/** Paginated sales history; empty filters are skipped. */
export function fetchSales(filters: SalesFilters = {}): Promise<SalesPage> {
    const { limit, offset, ...rest } = filters;
    const query = toQueryString({
        ...rest,
        limit: limit === undefined ? undefined : String(limit),
        offset: offset === undefined ? undefined : String(offset),
    });
    return apiJson(`/ventas/${query}`, 'Failed to fetch sales');
}

export function fetchSaleDetail(id: string): Promise<SaleDetail> {
    return apiJson(`/ventas/${id}`, 'Failed to fetch sale');
}

/** Admin only. Returns the updated sale detail. */
export function cancelSale(id: string, motivo: string): Promise<SaleDetail> {
    return apiJson(`/ventas/${id}/anular`, 'Failed to cancel sale', {
        method: 'POST',
        body: { motivo },
    });
}
