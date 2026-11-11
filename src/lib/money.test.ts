import { describe, expect, it } from 'vitest'
import { formatMoney, parseMoneyInput, roundMoney } from './money'

describe('roundMoney', () => {
    it('avoids float drift', () => {
        expect(roundMoney(0.1 + 0.2)).toBe(0.3)
        expect(roundMoney(1.005)).toBe(1.01)
        expect(roundMoney(19.99 * 3)).toBe(59.97)
    })
    it('keeps integers and rounds to 2 decimals', () => {
        expect(roundMoney(10)).toBe(10)
        expect(roundMoney(10.126)).toBe(10.13)
    })
})

describe('formatMoney', () => {
    it('formats with es-AR separators and 2 decimals', () => {
        expect(formatMoney(1234.5)).toBe('$1.234,50')
        expect(formatMoney(0)).toBe('$0,00')
        expect(formatMoney(1234567.891)).toBe('$1.234.567,89')
    })
    it('formats negatives with the sign before the symbol', () => {
        expect(formatMoney(-50)).toBe('-$50,00')
    })
})

describe('parseMoneyInput', () => {
    it('parses dot and comma decimals', () => {
        expect(parseMoneyInput('1234.5')).toBe(1234.5)
        expect(parseMoneyInput('1234,5')).toBe(1234.5)
        expect(parseMoneyInput('1.234,50')).toBe(1234.5)
        expect(parseMoneyInput(' 100 ')).toBe(100)
        expect(parseMoneyInput('0')).toBe(0)
    })
    it('treats a single dot followed by exactly 3 digits as a thousands separator (es-AR)', () => {
        expect(parseMoneyInput('15.000')).toBe(15000)
        expect(parseMoneyInput('1.500')).toBe(1500)
        expect(parseMoneyInput('1.234.567')).toBe(1234567)
        expect(parseMoneyInput('10.50')).toBe(10.5)
        expect(parseMoneyInput('10.5')).toBe(10.5)
    })
    it('returns null for invalid or negative input', () => {
        expect(parseMoneyInput('')).toBeNull()
        expect(parseMoneyInput('abc')).toBeNull()
        expect(parseMoneyInput('-5')).toBeNull()
        expect(parseMoneyInput('1,2,3')).toBeNull()
        expect(parseMoneyInput('NaN')).toBeNull()
    })
})
