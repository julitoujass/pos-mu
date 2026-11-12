'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { getErrorMessage } from '@/lib/errors'
import { cancelPayment, fetchPayment } from '../api'
import { isFinalStatus } from '../payment-states'
import type { TerminalPayment } from '../types'

export const POLL_INTERVAL_MS = 1000
/** After this long without a final state the screen stops waiting (the backend keeps reconciling). */
export const POLL_TIMEOUT_MS = 3 * 60 * 1000

type Options = {
    /** Called once, when polling observes a final state. */
    onFinal?: (pago: TerminalPayment) => void
}

type Polled = { id: string; pago: TerminalPayment | null; error: string | null; timedOut: boolean }

const EMPTY: Polled = { id: '', pago: null, error: null, timedOut: false }

/**
 * Follows a terminal payment: polls `GET /pagos/{id}` every second, stops on a
 * final state or after three minutes, and survives transient request errors.
 * Pass `null` while no payment is in progress.
 */
export function useTerminalPayment(pagoId: string | null, { onFinal }: Options = {}) {
    const [state, setState] = useState<Polled>(EMPTY)
    const [cancelling, setCancelling] = useState(false)

    const onFinalRef = useRef(onFinal)
    useEffect(() => {
        onFinalRef.current = onFinal
    })

    useEffect(() => {
        if (!pagoId) return
        const id = pagoId
        let cancelled = false
        let timer: ReturnType<typeof setTimeout> | undefined
        const startedAt = Date.now()

        async function poll() {
            try {
                const pago = await fetchPayment(id)
                if (cancelled) return
                setState({ id, pago, error: null, timedOut: false })
                if (isFinalStatus(pago.estado)) {
                    onFinalRef.current?.(pago)
                    return
                }
            } catch (err: unknown) {
                if (cancelled) return
                const error = getErrorMessage(err, 'No se pudo consultar el estado del pago')
                setState(prev => ({ ...(prev.id === id ? prev : { ...EMPTY, id }), error }))
            }
            if (Date.now() - startedAt >= POLL_TIMEOUT_MS) {
                setState(prev => ({ ...(prev.id === id ? prev : { ...EMPTY, id }), timedOut: true }))
                return
            }
            timer = setTimeout(poll, POLL_INTERVAL_MS)
        }

        poll()
        return () => {
            cancelled = true
            clearTimeout(timer)
        }
    }, [pagoId])

    /** Asks the terminal to cancel; the final state still arrives through the polling. */
    const cancel = useCallback(async () => {
        if (!pagoId) return
        setCancelling(true)
        try {
            const pago = await cancelPayment(pagoId)
            setState(prev => ({ ...(prev.id === pagoId ? prev : { ...EMPTY, id: pagoId }), pago, error: null }))
        } catch (err: unknown) {
            const error = getErrorMessage(err, 'No se pudo cancelar el cobro')
            setState(prev => ({ ...(prev.id === pagoId ? prev : { ...EMPTY, id: pagoId }), error }))
        } finally {
            setCancelling(false)
        }
    }, [pagoId])

    const current = state.id === pagoId ? state : EMPTY
    return { pago: current.pago, error: current.error, timedOut: current.timedOut, cancelling, cancel }
}
