import { describe, expect, it } from 'vitest'
import { todayInArgentina } from './dates'

describe('todayInArgentina', () => {
    it('uses the Argentina calendar date, not UTC', () => {
        // 01:30 UTC is still the previous day in Argentina (UTC-3).
        expect(todayInArgentina(new Date('2026-03-10T01:30:00Z'))).toBe('2026-03-09')
        expect(todayInArgentina(new Date('2026-03-10T12:00:00Z'))).toBe('2026-03-10')
    })
})
