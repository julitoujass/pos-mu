import { describe, expect, it } from 'vitest'
import { cloverCallbackMessage } from './clover-callback'

const params = (query: string) => new URLSearchParams(query)

describe('cloverCallbackMessage', () => {
    it('returns null when there is no clover param', () => {
        expect(cloverCallbackMessage(params(''))).toBeNull()
        expect(cloverCallbackMessage(params('foo=bar'))).toBeNull()
    })

    it('reports success on ok', () => {
        expect(cloverCallbackMessage(params('clover=ok'))).toEqual({ type: 'success', message: 'Clover conectado' })
    })

    it('maps a known error code to a friendly message', () => {
        const result = cloverCallbackMessage(params('clover=error&motivo=state_expirado'))
        expect(result?.type).toBe('error')
        expect(result?.message).toMatch(/expiró/i)
    })

    it('has a specific message for every code the backend emits', () => {
        const codes = [
            'state_invalido', 'state_expirado', 'parametros', 'sin_permiso', 'codigo_rechazado',
            'clover_no_disponible', 'sin_integracion', 'no_configurado', 'error_interno',
        ]
        const generic = cloverCallbackMessage(params('clover=error'))?.message
        for (const code of codes) {
            expect(cloverCallbackMessage(params(`clover=error&motivo=${code}`))?.message).not.toBe(generic)
        }
    })

    it('falls back to a generic message for unknown or missing codes', () => {
        const unknown = cloverCallbackMessage(params('clover=error&motivo=xyz'))
        const missing = cloverCallbackMessage(params('clover=error'))
        expect(unknown?.type).toBe('error')
        expect(unknown?.message).toBe(missing?.message)
        expect(unknown?.message).not.toContain('xyz')
    })

    it('ignores unexpected clover values', () => {
        expect(cloverCallbackMessage(params('clover=maybe'))).toBeNull()
    })
})
