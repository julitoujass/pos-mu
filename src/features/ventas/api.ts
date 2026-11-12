import { apiJson } from '@/lib/http';
import type { SaleCreate, SaleResponse } from './types';

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
