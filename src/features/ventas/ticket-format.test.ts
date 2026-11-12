import { describe, expect, it } from 'vitest'
import { TICKET_WIDTH, centerText, divider, formatPaymentSummary, itemLines, twoColumns, wrapText } from './ticket-format'

describe('twoColumns', () => {
    it('pads between left and right to the given width', () => {
        const line = twoColumns('Total', '$10,00', 20)
        expect(line).toHaveLength(20)
        expect(line.startsWith('Total')).toBe(true)
        expect(line.endsWith('$10,00')).toBe(true)
    })

    it('keeps one space when it does not fit', () => {
        expect(twoColumns('abcdefgh', '12345', 10)).toBe('abcdefgh 12345')
    })
})

describe('centerText', () => {
    it('centers within the width', () => {
        expect(centerText('abc', 9)).toBe('   abc   ')
    })

    it('returns the text untouched when wider than the width', () => {
        expect(centerText('abcdef', 4)).toBe('abcdef')
    })
})

describe('wrapText', () => {
    it('wraps on word boundaries', () => {
        expect(wrapText('uno dos tres cuatro', 8)).toEqual(['uno dos', 'tres', 'cuatro'])
    })

    it('splits words longer than the width', () => {
        expect(wrapText('abcdefghij', 4)).toEqual(['abcd', 'efgh', 'ij'])
    })

    it('returns no lines for empty text', () => {
        expect(wrapText('   ', 10)).toEqual([])
    })
})

describe('divider', () => {
    it('repeats the character to the ticket width', () => {
        expect(divider()).toBe('-'.repeat(TICKET_WIDTH))
    })
})

describe('itemLines', () => {
    it('shows the name, then quantity x price and the subtotal', () => {
        const lines = itemLines(
            { nombre: 'Camisa', detalle: 'M · Azul', cantidad: 2, precio: '$100,00', subtotal: '$200,00' },
            30,
        )
        expect(lines[0]).toBe('Camisa M · Azul')
        expect(lines[1]).toHaveLength(30)
        expect(lines[1].startsWith('2 x $100,00')).toBe(true)
        expect(lines[1].endsWith('$200,00')).toBe(true)
    })

    it('wraps long names', () => {
        const lines = itemLines(
            { nombre: 'Pantalon de trabajo reforzado', cantidad: 1, precio: '$1,00', subtotal: '$1,00' },
            16,
        )
        expect(lines.length).toBeGreaterThan(2)
        expect(lines.slice(0, -1).every(l => l.length <= 16)).toBe(true)
    })
})

describe('formatPaymentSummary', () => {
    const base = {
        metodo_pago: 'Tarjeta',
        tarjeta_marca: 'VISA',
        tarjeta_ultimos4: '4242',
        codigo_autorizacion: '123456',
        cuotas: 3,
        proveedor: 'clover',
    }

    it('joins method, brand, last four, authorization and installments', () => {
        expect(formatPaymentSummary(base)).toBe('Tarjeta VISA •••• 4242 · Aut. 123456 · 3 cuotas')
    })

    it('uses the singular for one installment', () => {
        expect(formatPaymentSummary({ ...base, cuotas: 1 })).toBe('Tarjeta VISA •••• 4242 · Aut. 123456 · 1 cuota')
    })

    it('skips the missing parts', () => {
        expect(
            formatPaymentSummary({ ...base, tarjeta_marca: null, codigo_autorizacion: null, cuotas: null }),
        ).toBe('Tarjeta •••• 4242')
        expect(
            formatPaymentSummary({ ...base, tarjeta_ultimos4: null, cuotas: 0 }),
        ).toBe('Tarjeta VISA · Aut. 123456')
    })

    it('returns null when there is no payment', () => {
        expect(formatPaymentSummary(null)).toBeNull()
        expect(formatPaymentSummary(undefined)).toBeNull()
    })
})
