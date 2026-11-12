import { describe, expect, it } from 'vitest'
import { computeSaleTotals, exceedsEmployeeDiscountLimit, parseAdjustment } from './pricing'

describe('computeSaleTotals', () => {
    it('returns the subtotal when there is no discount or surcharge', () => {
        expect(computeSaleTotals(1000)).toEqual({ subtotal: 1000, descuento: 0, recargo: 0, total: 1000 })
    })

    it('applies a percentage discount over the subtotal', () => {
        expect(computeSaleTotals(1000, { tipo: 'porcentaje', valor: 10 })).toEqual({
            subtotal: 1000, descuento: 100, recargo: 0, total: 900,
        })
    })

    it('applies a fixed discount', () => {
        expect(computeSaleTotals(1000, { tipo: 'monto', valor: 250 }).total).toBe(750)
    })

    it('applies a percentage surcharge over subtotal minus discount', () => {
        expect(
            computeSaleTotals(1000, { tipo: 'monto', valor: 200 }, { tipo: 'porcentaje', valor: 10 }),
        ).toEqual({ subtotal: 1000, descuento: 200, recargo: 80, total: 880 })
    })

    it('applies a fixed surcharge', () => {
        expect(computeSaleTotals(1000, undefined, { tipo: 'monto', valor: 50 }).total).toBe(1050)
    })

    it('rounds to 2 decimals', () => {
        const totals = computeSaleTotals(99.99, { tipo: 'porcentaje', valor: 7.5 })
        expect(totals.descuento).toBe(7.5)
        expect(totals.total).toBe(92.49)
    })

    it('never discounts more than the subtotal', () => {
        const totals = computeSaleTotals(100, { tipo: 'monto', valor: 500 })
        expect(totals.descuento).toBe(100)
        expect(totals.total).toBe(0)
    })
})

describe('exceedsEmployeeDiscountLimit', () => {
    it('allows no discount and exactly 10%', () => {
        expect(exceedsEmployeeDiscountLimit(1000)).toBe(false)
        expect(exceedsEmployeeDiscountLimit(1000, { tipo: 'porcentaje', valor: 10 })).toBe(false)
        expect(exceedsEmployeeDiscountLimit(1000, { tipo: 'monto', valor: 100 })).toBe(false)
    })

    it('rejects more than 10% as percentage or amount', () => {
        expect(exceedsEmployeeDiscountLimit(1000, { tipo: 'porcentaje', valor: 10.5 })).toBe(true)
        expect(exceedsEmployeeDiscountLimit(1000, { tipo: 'monto', valor: 100.01 })).toBe(true)
    })
})

describe('parseAdjustment', () => {
    it('returns no adjustment for empty or zero input', () => {
        expect(parseAdjustment('porcentaje', '')).toEqual({})
        expect(parseAdjustment('monto', '0')).toEqual({})
    })

    it('parses es-AR amounts', () => {
        expect(parseAdjustment('monto', '1.500,50')).toEqual({ adjustment: { tipo: 'monto', valor: 1500.5 } })
        expect(parseAdjustment('porcentaje', '7,5')).toEqual({ adjustment: { tipo: 'porcentaje', valor: 7.5 } })
    })

    it('reports invalid input', () => {
        expect(parseAdjustment('monto', 'abc').error).toBe('Valor inválido')
        expect(parseAdjustment('monto', '-5').error).toBe('Valor inválido')
    })

    it('rejects percentages above 100', () => {
        expect(parseAdjustment('porcentaje', '101').error).toBe('El porcentaje no puede superar 100')
        expect(parseAdjustment('porcentaje', '100').adjustment).toEqual({ tipo: 'porcentaje', valor: 100 })
    })
})
