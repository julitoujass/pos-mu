import { roundMoney } from '@/lib/money'
import type { SaleDetail, SaleDetailItem, SaleItemCreate } from './types'

/** Units of an item that can still be returned. */
export function remainingQuantity(item: Pick<SaleDetailItem, 'cantidad' | 'cantidad_devuelta'>): number {
    return Math.max(0, item.cantidad - (item.cantidad_devuelta ?? 0))
}

/** Share of the list price actually paid (discount/surcharge applied): total / subtotal. */
export function refundFactor(sale: Pick<SaleDetail, 'subtotal' | 'total'>): number {
    return sale.subtotal > 0 ? sale.total / sale.subtotal : 1
}

/** Estimated refund: what was paid, proportionally. The server is authoritative. */
export function estimateRefund(
    items: Pick<SaleDetailItem, 'precio_unitario' | 'cantidad'>[],
    factor: number,
): number {
    const gross = items.reduce((acc, item) => acc + item.precio_unitario * item.cantidad, 0)
    return roundMoney(gross * factor)
}

/** Turns the per-variant quantity inputs into the request items, dropping zeros. */
export function buildReturnItems(quantities: Record<string, number>): SaleItemCreate[] {
    return Object.entries(quantities)
        .filter(([, cantidad]) => cantidad > 0)
        .map(([variante_id, cantidad]) => ({ variante_id, cantidad }))
}

/** A return can be registered on a completed sale that still has units left. */
export function canRegisterReturn(sale: Pick<SaleDetail, 'estado'> & { items: Pick<SaleDetailItem, 'cantidad' | 'cantidad_devuelta'>[] }): boolean {
    return sale.estado === 'completada' && sale.items.some(item => remainingQuantity(item) > 0)
}
