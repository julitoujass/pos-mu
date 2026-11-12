'use client'

import { useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'
import {
    isSuccess,
    startTerminalPayment,
    useTerminalPayment,
    type TerminalPayment,
    type TerminalPaymentCreate,
} from '@/features/pagos'
import { getErrorMessage } from '@/lib/errors'

type Session = {
    pagoId: string
    /** Total charged, as priced by the server. */
    total: number
    /** Kept so "Reintentar" charges the same sale again. */
    request: TerminalPaymentCreate
}

type Options = {
    /** The charge was approved and the sale registered. */
    onApproved: (pago: TerminalPayment) => void
}

/** Card / QR checkout through the payment terminal: starts the charge and follows it. */
export function useTerminalCheckout({ onApproved }: Options) {
    const [session, setSession] = useState<Session | null>(null)
    const starting = useRef(false)

    const payment = useTerminalPayment(session?.pagoId ?? null, {
        onFinal: pago => {
            if (isSuccess(pago.estado)) onApproved(pago)
        },
    })

    /** Starts a charge; rejects with the backend `detail` (e.g. "Ya hay un cobro en curso"). */
    const start = useCallback(async (request: TerminalPaymentCreate) => {
        const started = await startTerminalPayment(request)
        setSession({ pagoId: started.pago_id, total: started.total, request })
    }, [])

    const retry = useCallback(async () => {
        if (!session || starting.current) return
        starting.current = true
        try {
            await start(session.request)
        } catch (err: unknown) {
            toast.error(getErrorMessage(err, 'No se pudo iniciar el cobro'))
        } finally {
            starting.current = false
        }
    }, [session, start])

    const close = useCallback(() => setSession(null), [])

    return { session, payment, start, retry, close }
}
