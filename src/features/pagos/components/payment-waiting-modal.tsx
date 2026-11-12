'use client'

import { useId } from 'react'
import { AlertTriangle, CheckCircle2, Loader2, Printer, RotateCcw, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { formatMoney } from '@/lib/money'
import { paymentPhase, userMessage, type PaymentPhase } from '../payment-states'
import type { TerminalMethod, TerminalPayment } from '../types'

type PaymentWaitingModalProps = {
    /** Latest state; null until the first poll answers. */
    pago: TerminalPayment | null
    /** Total charged, as priced by the server. */
    total: number
    method: TerminalMethod
    timedOut: boolean
    error: string | null
    cancelling: boolean
    onCancel: () => void
    onPrintTicket: (saleId: string) => void
    /** Starts a new charge with the same sale. */
    onRetry: () => void
    /** Closes the dialog ("Nueva venta", "Cambiar método", "Cerrar"). */
    onClose: () => void
}

const outlineButton = 'px-4 py-2.5 font-medium bg-muted text-foreground hover:bg-muted/80'

/** Blocking dialog that follows a terminal charge until the sale is registered or the charge fails. */
export function PaymentWaitingModal({
    pago,
    total,
    method,
    timedOut,
    error,
    cancelling,
    onCancel,
    onPrintTicket,
    onRetry,
    onClose,
}: PaymentWaitingModalProps) {
    const titleId = useId()
    const estado = pago?.estado ?? 'pendiente'
    const phase = paymentPhase(estado)
    const inProgress = phase === 'waiting' || phase === 'registering' || phase === 'verifying'
    const gaveUp = inProgress && timedOut

    return (
        <Modal
            onClose={onClose}
            dismissible={false}
            labelledBy={titleId}
            backdrop="strong"
            className="bg-card w-full max-w-md rounded-2xl shadow-2xl border border-border p-8 text-center"
        >
            <p className="text-sm text-muted-foreground">{method}</p>
            <p className="text-4xl font-black text-foreground tabular-nums tracking-tight mt-1">{formatMoney(total)}</p>

            <div role="status" aria-live="polite" className="mt-6 space-y-3">
                <PhaseIcon phase={phase} gaveUp={gaveUp} />
                <h3 id={titleId} className="text-lg font-bold text-foreground">
                    {userMessage(estado)}
                </h3>
                {phase === 'success' && pago && <CardSummary pago={pago} />}
                {phase === 'refund' && pago?.error && <p className="text-sm text-muted-foreground">{pago.error}</p>}
                {gaveUp && (
                    <p className="text-sm text-muted-foreground">
                        Todavía no hay respuesta. Seguí verificando desde Pagos a revisar.
                    </p>
                )}
                {error && <p className="text-sm text-destructive">{error}</p>}
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
                {phase === 'waiting' && !gaveUp && (
                    <Button
                        variant="plain"
                        onClick={onCancel}
                        loading={cancelling}
                        loadingLabel="Cancelando..."
                        className={outlineButton}
                    >
                        Cancelar
                    </Button>
                )}
                {phase === 'success' && pago?.venta_id && (
                    <Button
                        variant="plain"
                        onClick={() => onPrintTicket(pago.venta_id as string)}
                        icon={<Printer size={16} />}
                        className={outlineButton}
                    >
                        Imprimir ticket
                    </Button>
                )}
                {phase === 'success' && (
                    <Button onClick={onClose} className="px-4 py-2.5 font-bold">Nueva venta</Button>
                )}
                {phase === 'declined' && (
                    <>
                        <Button onClick={onRetry} icon={<RotateCcw size={16} />} className="px-4 py-2.5 font-bold">
                            Reintentar
                        </Button>
                        <Button variant="plain" onClick={onClose} className={outlineButton}>Cambiar método</Button>
                    </>
                )}
                {(phase === 'refund' || gaveUp) && (
                    <Button variant="plain" onClick={onClose} className={outlineButton}>Cerrar</Button>
                )}
            </div>
        </Modal>
    )
}

function PhaseIcon({ phase, gaveUp }: { phase: PaymentPhase; gaveUp: boolean }) {
    const base = 'mx-auto'
    if (gaveUp) return <AlertTriangle size={40} className={`${base} text-amber-500`} aria-hidden="true" />
    switch (phase) {
        case 'success':
            return <CheckCircle2 size={40} className={`${base} text-green-600`} aria-hidden="true" />
        case 'declined':
            return <XCircle size={40} className={`${base} text-destructive`} aria-hidden="true" />
        case 'refund':
            return <AlertTriangle size={40} className={`${base} text-amber-500`} aria-hidden="true" />
        default:
            return <Loader2 size={40} className={`${base} animate-spin text-brand`} aria-hidden="true" />
    }
}

function CardSummary({ pago }: { pago: TerminalPayment }) {
    const card = [pago.tarjeta_marca, pago.tarjeta_ultimos4 && `•••• ${pago.tarjeta_ultimos4}`].filter(Boolean).join(' ')
    return (
        <div className="text-sm text-muted-foreground space-y-0.5">
            {card && <p>{card}</p>}
            {pago.codigo_autorizacion && <p>Aut. {pago.codigo_autorizacion}</p>}
        </div>
    )
}
