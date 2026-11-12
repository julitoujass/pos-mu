import { describe, expect, it } from 'vitest'
import { isProtectedPath } from './protected-paths'

describe('isProtectedPath', () => {
    it('protects the dashboard and the ticket routes', () => {
        expect(isProtectedPath('/dashboard')).toBe(true)
        expect(isProtectedPath('/dashboard/venta')).toBe(true)
        expect(isProtectedPath('/ticket/abc-123')).toBe(true)
    })

    it('leaves the login page and unrelated paths public', () => {
        expect(isProtectedPath('/')).toBe(false)
        expect(isProtectedPath('/ticketing')).toBe(false)
    })
})
