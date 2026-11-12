import { statusLabel } from '../payment-states'
import type { PaymentStatus } from '../types'

const TONE: Record<PaymentStatus, string> = {
    pendiente: 'bg-muted text-muted-foreground',
    enviado: 'bg-muted text-muted-foreground',
    aprobado: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    venta_registrada: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    rechazado: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    cancelado: 'bg-muted text-muted-foreground',
    indeterminado: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    error_registro: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    reembolsado: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
}

export function PaymentStatusBadge({ estado }: { estado: PaymentStatus }) {
    return (
        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${TONE[estado]}`}>
            {statusLabel(estado)}
        </span>
    )
}
