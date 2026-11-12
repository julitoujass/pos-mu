import { describe, expect, it } from 'vitest'
import { formatDate, formatDateTime, formatLongDate, formatTime } from './dates'

describe('dates', () => {
    it('shows afternoon times on a 24h clock', () => {
        expect(formatDateTime('2026-11-12T16:09:00Z')).toBe('12/11/2026 13:09')
        expect(formatTime('2026-11-12T16:09:00Z')).toBe('13:09')
    })

    it('distinguishes early morning from afternoon', () => {
        expect(formatTime('2026-11-12T04:09:00Z')).toBe('01:09')
    })

    it('renders midnight as 00:00', () => {
        expect(formatTime('2026-11-12T03:00:00Z')).toBe('00:00')
        expect(formatDateTime('2026-11-12T03:00:00Z')).toBe('12/11/2026 00:00')
    })

    it('uses the store time zone for the date', () => {
        expect(formatDate('2026-11-12T02:00:00Z')).toBe('11/11/2026')
        expect(formatDate('2026-11-12T16:09:00Z')).toBe('12/11/2026')
    })

    it('formats the long date', () => {
        expect(formatLongDate('2026-11-12T16:09:00Z')).toBe('jueves, 12 de noviembre de 2026')
    })

    it('returns an empty string for missing or invalid input', () => {
        for (const fn of [formatDate, formatDateTime, formatTime, formatLongDate]) {
            expect(fn(null)).toBe('')
            expect(fn(undefined)).toBe('')
            expect(fn('nope')).toBe('')
        }
    })
})
