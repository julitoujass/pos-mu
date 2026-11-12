import { describe, expect, it } from 'vitest'
import { canReconcile, filterToStatuses, mergePages } from './review-filters'
import type { TerminalPayment } from './types'

function pago(id: string, created_at: string, estado: TerminalPayment['estado'] = 'indeterminado'): TerminalPayment {
    return {
        id,
        estado,
        metodo_pago: 'Tarjeta',
        monto: 100,
        venta_id: null,
        tarjeta_marca: null,
        tarjeta_ultimos4: null,
        codigo_autorizacion: null,
        cuotas: null,
        error: null,
        created_at,
        updated_at: created_at,
    }
}

describe('filterToStatuses', () => {
    it('"revision" covers the unresolved states', () => {
        expect(filterToStatuses('revision')).toEqual(['indeterminado', 'error_registro'])
    })

    it('a single state maps to itself', () => {
        expect(filterToStatuses('rechazado')).toEqual(['rechazado'])
    })

    it('"todos" means no state filter', () => {
        expect(filterToStatuses('todos')).toEqual([undefined])
    })
})

describe('mergePages', () => {
    it('merges items newest first and sums the totals', () => {
        const merged = mergePages([
            { items: [pago('a', '2026-01-01T10:00:00Z'), pago('b', '2026-01-03T10:00:00Z')], total: 2 },
            { items: [pago('c', '2026-01-02T10:00:00Z', 'error_registro')], total: 5 },
        ])
        expect(merged.items.map(p => p.id)).toEqual(['b', 'c', 'a'])
        expect(merged.total).toBe(7)
    })
})

describe('canReconcile', () => {
    it('is available while the payment is not final', () => {
        expect(canReconcile('indeterminado')).toBe(true)
        expect(canReconcile('error_registro')).toBe(true)
        expect(canReconcile('venta_registrada')).toBe(false)
        expect(canReconcile('rechazado')).toBe(false)
    })
})
