import { describe, expect, it } from 'vitest'
import { isFinalStatus, isSuccess, paymentPhase, statusLabel, userMessage, usesTerminal } from './payment-states'
import type { PaymentStatus } from './types'

describe('isFinalStatus', () => {
    it.each<[PaymentStatus, boolean]>([
        ['pendiente', false],
        ['enviado', false],
        ['aprobado', false],
        ['indeterminado', false],
        ['error_registro', false],
        ['venta_registrada', true],
        ['rechazado', true],
        ['cancelado', true],
        ['reembolsado', true],
    ])('%s -> %s', (estado, expected) => {
        expect(isFinalStatus(estado)).toBe(expected)
    })
})

describe('isSuccess', () => {
    it('is true only when the sale was registered', () => {
        expect(isSuccess('venta_registrada')).toBe(true)
        expect(isSuccess('aprobado')).toBe(false)
        expect(isSuccess('rechazado')).toBe(false)
    })
})

describe('userMessage', () => {
    it('describes each state for the cashier', () => {
        expect(userMessage('pendiente')).toBe('Esperando pago en el Clover…')
        expect(userMessage('enviado')).toBe('Esperando pago en el Clover…')
        expect(userMessage('aprobado')).toBe('Registrando la venta…')
        expect(userMessage('indeterminado')).toBe('Verificando el pago…')
        expect(userMessage('venta_registrada')).toBe('Pago aprobado')
        expect(userMessage('rechazado')).toBe('Pago no aprobado')
        expect(userMessage('cancelado')).toBe('Pago no aprobado')
        expect(userMessage('error_registro')).toContain('No se pudo registrar la venta')
        expect(userMessage('reembolsado')).toBe('No se pudo registrar la venta. El cobro fue reembolsado.')
    })
})

describe('paymentPhase', () => {
    it('groups states by what the screen shows', () => {
        expect(paymentPhase('pendiente')).toBe('waiting')
        expect(paymentPhase('enviado')).toBe('waiting')
        expect(paymentPhase('aprobado')).toBe('registering')
        expect(paymentPhase('indeterminado')).toBe('verifying')
        expect(paymentPhase('venta_registrada')).toBe('success')
        expect(paymentPhase('rechazado')).toBe('declined')
        expect(paymentPhase('cancelado')).toBe('declined')
        expect(paymentPhase('error_registro')).toBe('refund')
        expect(paymentPhase('reembolsado')).toBe('refund')
    })
})

describe('statusLabel', () => {
    it('gives a short label for badges', () => {
        expect(statusLabel('indeterminado')).toBe('Indeterminado')
        expect(statusLabel('error_registro')).toBe('Error al registrar')
    })
})

describe('usesTerminal', () => {
    const enabled = { proveedor: 'fake', habilitado: true, conectado: true } as const
    it('is true for card and QR with the integration enabled', () => {
        expect(usesTerminal('Tarjeta', enabled)).toBe(true)
        expect(usesTerminal('QR', enabled)).toBe(true)
    })
    it('is false for cash, disabled or unknown integration', () => {
        expect(usesTerminal('Efectivo', enabled)).toBe(false)
        expect(usesTerminal('Tarjeta', { ...enabled, habilitado: false })).toBe(false)
        expect(usesTerminal('Tarjeta', null)).toBe(false)
    })
})
