import { describe, expect, it } from 'vitest'
import { validateNewUser } from './validation'

const valid = { email: 'a@b.com', password: '12345678', nombre: 'Ana', rolId: 2 }

describe('validateNewUser', () => {
    it('accepts valid data', () => {
        expect(validateNewUser(valid)).toBeNull()
    })

    it('requires a well-formed email', () => {
        expect(validateNewUser({ ...valid, email: '' })).toBe('Ingresá el email')
        expect(validateNewUser({ ...valid, email: 'abc' })).toBe('El email no es válido')
    })

    it('requires a password of 8 to 72 characters', () => {
        expect(validateNewUser({ ...valid, password: '1234567' })).toBe('La contraseña debe tener entre 8 y 72 caracteres')
        expect(validateNewUser({ ...valid, password: 'a'.repeat(73) })).toBe('La contraseña debe tener entre 8 y 72 caracteres')
        expect(validateNewUser({ ...valid, password: 'a'.repeat(72) })).toBeNull()
    })

    it('requires a name and a role', () => {
        expect(validateNewUser({ ...valid, nombre: '  ' })).toBe('Ingresá el nombre')
        expect(validateNewUser({ ...valid, rolId: null })).toBe('Elegí un rol')
    })
})
