// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const pagos = vi.hoisted(() => ({
    startTerminalPayment: vi.fn(),
    useTerminalPayment: vi.fn(),
    onFinal: undefined as undefined | ((pago: { estado: string; venta_id: string | null; monto: number }) => void),
}))

vi.mock('@/features/pagos', () => ({
    startTerminalPayment: pagos.startTerminalPayment,
    useTerminalPayment: pagos.useTerminalPayment,
    isSuccess: (estado: string) => estado === 'venta_registrada',
}))

import { useTerminalCheckout } from './use-terminal-checkout'

const request = { metodo_pago: 'Tarjeta' as const, items: [{ variante_id: 'v1', cantidad: 1 }], cliente_id: null }

beforeEach(() => {
    pagos.startTerminalPayment.mockReset()
    pagos.useTerminalPayment.mockReset()
    pagos.onFinal = undefined
    pagos.useTerminalPayment.mockImplementation((_id: string | null, options?: { onFinal?: typeof pagos.onFinal }) => {
        pagos.onFinal = options?.onFinal
        return { pago: null, error: null, timedOut: false, cancelling: false, cancel: vi.fn() }
    })
})

describe('useTerminalCheckout', () => {
    it('starts a charge and tracks its session', async () => {
        pagos.startTerminalPayment.mockResolvedValue({ pago_id: 'p1', total: 1500, estado: 'pendiente' })
        const { result } = renderHook(() => useTerminalCheckout({ onApproved: vi.fn() }))
        expect(result.current.session).toBeNull()

        await act(async () => {
            await result.current.start(request)
        })

        expect(pagos.startTerminalPayment).toHaveBeenCalledWith(request)
        expect(result.current.session).toEqual({ pagoId: 'p1', total: 1500, request })
        expect(pagos.useTerminalPayment).toHaveBeenLastCalledWith('p1', expect.any(Object))
    })

    it('lets a start failure reach the caller and keeps no session', async () => {
        pagos.startTerminalPayment.mockRejectedValue(new Error('Ya hay un cobro en curso'))
        const { result } = renderHook(() => useTerminalCheckout({ onApproved: vi.fn() }))

        await act(async () => {
            await expect(result.current.start(request)).rejects.toThrow('Ya hay un cobro en curso')
        })
        expect(result.current.session).toBeNull()
    })

    it('reports an approval only when the sale was registered', async () => {
        pagos.startTerminalPayment.mockResolvedValue({ pago_id: 'p1', total: 1500, estado: 'pendiente' })
        const onApproved = vi.fn()
        const { result } = renderHook(() => useTerminalCheckout({ onApproved }))
        await act(async () => {
            await result.current.start(request)
        })

        act(() => pagos.onFinal?.({ estado: 'rechazado', venta_id: null, monto: 1500 }))
        expect(onApproved).not.toHaveBeenCalled()

        act(() => pagos.onFinal?.({ estado: 'venta_registrada', venta_id: 'v1', monto: 1500 }))
        expect(onApproved).toHaveBeenCalledWith(expect.objectContaining({ venta_id: 'v1' }))
    })

    it('retries with the same sale data and replaces the session', async () => {
        pagos.startTerminalPayment
            .mockResolvedValueOnce({ pago_id: 'p1', total: 1500, estado: 'pendiente' })
            .mockResolvedValueOnce({ pago_id: 'p2', total: 1500, estado: 'pendiente' })
        const { result } = renderHook(() => useTerminalCheckout({ onApproved: vi.fn() }))
        await act(async () => {
            await result.current.start(request)
        })

        await act(async () => {
            await result.current.retry()
        })

        expect(pagos.startTerminalPayment).toHaveBeenLastCalledWith(request)
        expect(result.current.session?.pagoId).toBe('p2')
    })

    it('close drops the session', async () => {
        pagos.startTerminalPayment.mockResolvedValue({ pago_id: 'p1', total: 1500, estado: 'pendiente' })
        const { result } = renderHook(() => useTerminalCheckout({ onApproved: vi.fn() }))
        await act(async () => {
            await result.current.start(request)
        })

        act(() => result.current.close())

        expect(result.current.session).toBeNull()
    })
})
