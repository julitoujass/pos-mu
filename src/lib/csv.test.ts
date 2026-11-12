import { describe, expect, it } from 'vitest'
import { CSV_BOM, toCsv } from './csv'

type Row = { name: string; amount: number | null; note?: string }

const columns = [
    { header: 'Nombre', value: (r: Row) => r.name },
    { header: 'Monto', value: (r: Row) => r.amount },
    { header: 'Nota', value: (r: Row) => r.note },
]

describe('toCsv', () => {
    it('starts with a UTF-8 BOM so Excel detects the encoding', () => {
        expect(toCsv([], columns).startsWith(CSV_BOM)).toBe(true)
    })

    it('writes the header and rows separated by semicolons', () => {
        const csv = toCsv([{ name: 'Camisa', amount: 10, note: 'ok' }], columns)
        expect(csv).toBe(`${CSV_BOM}Nombre;Monto;Nota\r\nCamisa;10;ok`)
    })

    it('uses a decimal comma for numbers', () => {
        const csv = toCsv([{ name: 'A', amount: 1234.5 }], columns)
        expect(csv).toContain('A;1234,5;')
    })

    it('leaves null and undefined cells empty', () => {
        const csv = toCsv([{ name: 'A', amount: null }], columns)
        expect(csv).toContain('A;;')
    })

    it('quotes values with separators, quotes or line breaks', () => {
        const csv = toCsv(
            [
                { name: 'a;b', amount: 1 },
                { name: 'say "hi"', amount: 2 },
                { name: 'line1\nline2', amount: 3 },
            ],
            columns,
        )
        expect(csv).toContain('"a;b";1;')
        expect(csv).toContain('"say ""hi""";2;')
        expect(csv).toContain('"line1\nline2";3;')
    })

    it('quotes headers too', () => {
        const csv = toCsv([], [{ header: 'A;B', value: () => '' }])
        expect(csv).toBe(`${CSV_BOM}"A;B"`)
    })
})
