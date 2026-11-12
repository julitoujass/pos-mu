import { describe, expect, it } from 'vitest'
import {
    buildReturnItems,
    canRegisterReturn,
    estimateRefund,
    refundFactor,
    remainingQuantity,
} from './returns'

describe('remainingQuantity', () => {
    it('subtracts what was already returned', () => {
        expect(remainingQuantity({ cantidad: 5, cantidad_devuelta: 2 })).toBe(3)
    })

    it('treats a missing returned quantity as zero', () => {
        expect(remainingQuantity({ cantidad: 5 })).toBe(5)
    })

    it('never goes below zero', () => {
        expect(remainingQuantity({ cantidad: 2, cantidad_devuelta: 3 })).toBe(0)
    })
})

describe('refundFactor', () => {
    it('is total / subtotal', () => {
        expect(refundFactor({ subtotal: 1000, total: 900 })).toBe(0.9)
        expect(refundFactor({ subtotal: 1000, total: 1100 })).toBe(1.1)
    })

    it('falls back to 1 for a zero subtotal', () => {
        expect(refundFactor({ subtotal: 0, total: 0 })).toBe(1)
    })
})

describe('estimateRefund', () => {
    it('applies the factor to quantity x unit price', () => {
        const items = [
            { precio_unitario: 100, cantidad: 2 },
            { precio_unitario: 50, cantidad: 1 },
        ]
        expect(estimateRefund(items, 0.9)).toBe(225)
    })

    it('is the plain sum with factor 1', () => {
        expect(estimateRefund([{ precio_unitario: 99.99, cantidad: 3 }], 1)).toBe(299.97)
    })

    it('rounds to 2 decimals', () => {
        expect(estimateRefund([{ precio_unitario: 10, cantidad: 1 }], 1 / 3)).toBe(3.33)
    })

    it('is 0 without items', () => {
        expect(estimateRefund([], 0.9)).toBe(0)
    })
})

describe('buildReturnItems', () => {
    it('keeps only positive quantities', () => {
        expect(buildReturnItems({ a: 2, b: 0, c: 1 })).toEqual([
            { variante_id: 'a', cantidad: 2 },
            { variante_id: 'c', cantidad: 1 },
        ])
    })

    it('is empty when nothing is selected', () => {
        expect(buildReturnItems({ a: 0 })).toEqual([])
    })
})

describe('canRegisterReturn', () => {
    const open = { estado: 'completada' as const, items: [{ cantidad: 2, cantidad_devuelta: 1 }] }

    it('is true for a completed sale with remaining units', () => {
        expect(canRegisterReturn(open)).toBe(true)
    })

    it('is false for a cancelled sale', () => {
        expect(canRegisterReturn({ ...open, estado: 'anulada' })).toBe(false)
    })

    it('is false when everything was already returned', () => {
        expect(canRegisterReturn({ estado: 'completada', items: [{ cantidad: 2, cantidad_devuelta: 2 }] })).toBe(false)
    })
})
