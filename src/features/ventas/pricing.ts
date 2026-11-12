import { parseMoneyInput, roundMoney } from '@/lib/money'
import type { AdjustmentType, SaleAdjustment } from './types'

/** Maximum discount (as % of the subtotal) an employee can apply. */
export const EMPLOYEE_MAX_DISCOUNT_PERCENT = 10

export type SaleTotals = {
    subtotal: number
    descuento: number
    recargo: number
    total: number
}

/** Discount amount, never above the subtotal. */
function discountAmount(subtotal: number, descuento?: SaleAdjustment): number {
    if (!descuento) return 0
    const raw = descuento.tipo === 'porcentaje' ? (subtotal * descuento.valor) / 100 : descuento.valor
    return Math.min(roundMoney(raw), subtotal)
}

/**
 * Estimate mirroring the backend rules: the discount applies over the subtotal,
 * the surcharge (when a percentage) over subtotal minus discount. The server
 * stays authoritative.
 */
export function computeSaleTotals(
    subtotal: number,
    descuento?: SaleAdjustment,
    recargo?: SaleAdjustment,
): SaleTotals {
    const discount = discountAmount(subtotal, descuento)
    const base = subtotal - discount
    const surcharge = !recargo
        ? 0
        : roundMoney(recargo.tipo === 'porcentaje' ? (base * recargo.valor) / 100 : recargo.valor)
    return {
        subtotal: roundMoney(subtotal),
        descuento: discount,
        recargo: surcharge,
        total: roundMoney(base + surcharge),
    }
}

/** True when an employee's discount is above the allowed share of the subtotal. */
export function exceedsEmployeeDiscountLimit(subtotal: number, descuento?: SaleAdjustment): boolean {
    if (!descuento) return false
    const raw = descuento.tipo === 'porcentaje' ? (subtotal * descuento.valor) / 100 : descuento.valor
    return roundMoney(raw) > roundMoney((subtotal * EMPLOYEE_MAX_DISCOUNT_PERCENT) / 100)
}

export type ParsedAdjustment = { adjustment?: SaleAdjustment; error?: string }

/** Turns the raw input of a discount/surcharge control into an adjustment. Empty or zero means none. */
export function parseAdjustment(tipo: AdjustmentType, input: string): ParsedAdjustment {
    if (!input.trim()) return {}
    const valor = parseMoneyInput(input)
    if (valor === null) return { error: 'Valor inválido' }
    if (valor === 0) return {}
    if (tipo === 'porcentaje' && valor > 100) return { error: 'El porcentaje no puede superar 100' }
    return { adjustment: { tipo, valor } }
}
