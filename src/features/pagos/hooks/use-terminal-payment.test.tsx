// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { TerminalPayment } from '../types'

vi.mock('../api', () => ({
    fetchPayment: vi.fn(),
    cancelPayment: vi.fn(),
}))

import { cancelPayment, fetchPayment } from '../api'
import { POLL_INTERVAL_MS, POLL_TIMEOUT_MS, useTerminalPayment } from './use-terminal-payment'

const fetchMock = vi.mocked(fetchPayment)
const cancelMock = vi.mocked(cancelPayment)

function pago(estado: TerminalPayment['estado'], extra: Partial<TerminalPayment> = {}): TerminalPayment {
    return {
        id: 'p1',
        estado,
        metodo_pago: 'Tarjeta',
        monto: 1000,
        venta_id: null,
        tarjeta_marca: null,
        tarjeta_ultimos4: null,
        codigo_autorizacion: null,
        cuotas: null,
        error: null,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
        ...extra,
    }
}

/** Lets pending promises settle without advancing the fake clock. */
async function flush() {
    await act(async () => {
        await vi.advanceTimersByTimeAsync(0)
    })
}

async function tick(ms = POLL_INTERVAL_MS) {
    await act(async () => {
        await vi.advanceTimersByTimeAsync(ms)
    })
}

beforeEach(() => {
    vi.useFakeTimers()
    fetchMock.mockReset()
    cancelMock.mockReset()
})

afterEach(() => {
    vi.useRealTimers()
})

describe('useTerminalPayment', () => {
    it('does nothing without a payment id', async () => {
        renderHook(() => useTerminalPayment(null))
        await tick(5000)
        expect(fetchMock).not.toHaveBeenCalled()
    })

    it('polls every second until a final state and then stops', async () => {
        fetchMock
            .mockResolvedValueOnce(pago('enviado'))
            .mockResolvedValueOnce(pago('enviado'))
            .mockResolvedValueOnce(pago('venta_registrada', { venta_id: 'v1' }))
        const onFinal = vi.fn()
        const { result } = renderHook(() => useTerminalPayment('p1', { onFinal }))

        await flush()
        expect(fetchMock).toHaveBeenCalledTimes(1)
        expect(result.current.pago?.estado).toBe('enviado')

        await tick()
        expect(fetchMock).toHaveBeenCalledTimes(2)

        await tick()
        expect(fetchMock).toHaveBeenCalledTimes(3)
        expect(result.current.pago?.estado).toBe('venta_registrada')
        expect(onFinal).toHaveBeenCalledTimes(1)
        expect(onFinal).toHaveBeenCalledWith(expect.objectContaining({ venta_id: 'v1' }))

        await tick(5000)
        expect(fetchMock).toHaveBeenCalledTimes(3)
    })

    it('keeps polling through non-final states such as indeterminado', async () => {
        fetchMock.mockResolvedValue(pago('indeterminado'))
        renderHook(() => useTerminalPayment('p1'))
        await flush()
        await tick(3000)
        expect(fetchMock).toHaveBeenCalledTimes(4)
    })

    it('keeps polling after a transient error and exposes it', async () => {
        fetchMock.mockRejectedValueOnce(new Error('sin red')).mockResolvedValueOnce(pago('rechazado'))
        const { result } = renderHook(() => useTerminalPayment('p1'))
        await flush()
        expect(result.current.error).toBe('sin red')

        await tick()
        expect(result.current.pago?.estado).toBe('rechazado')
        expect(result.current.error).toBeNull()
    })

    it('gives up after three minutes with a timeout flag', async () => {
        fetchMock.mockResolvedValue(pago('indeterminado'))
        const { result } = renderHook(() => useTerminalPayment('p1'))
        await flush()
        expect(result.current.timedOut).toBe(false)

        await tick(POLL_TIMEOUT_MS + POLL_INTERVAL_MS)
        expect(result.current.timedOut).toBe(true)

        const calls = fetchMock.mock.calls.length
        await tick(10_000)
        expect(fetchMock.mock.calls.length).toBe(calls)
    })

    it('stops polling on unmount', async () => {
        fetchMock.mockResolvedValue(pago('enviado'))
        const { unmount } = renderHook(() => useTerminalPayment('p1'))
        await flush()
        unmount()
        await tick(5000)
        expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it('cancel asks the backend and shows the returned state', async () => {
        fetchMock.mockResolvedValue(pago('enviado'))
        cancelMock.mockResolvedValue(pago('enviado', { error: 'cancelando' }))
        const { result } = renderHook(() => useTerminalPayment('p1'))
        await flush()

        await act(async () => {
            await result.current.cancel()
        })

        expect(cancelMock).toHaveBeenCalledWith('p1')
        expect(result.current.pago?.error).toBe('cancelando')
        expect(result.current.cancelling).toBe(false)
    })

    it('cancel failure is reported as an error', async () => {
        fetchMock.mockResolvedValue(pago('enviado'))
        cancelMock.mockRejectedValue(new Error('No se pudo cancelar'))
        const { result } = renderHook(() => useTerminalPayment('p1'))
        await flush()

        await act(async () => {
            await result.current.cancel()
        })

        expect(result.current.error).toBe('No se pudo cancelar')
    })
})
