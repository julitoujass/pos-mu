import type { PaymentStatus, TerminalStatus } from './types';

/** What the waiting dialog shows for a payment state. */
export type PaymentPhase = 'waiting' | 'registering' | 'verifying' | 'success' | 'declined' | 'refund';

/**
 * Final states stop the polling. `indeterminado` and `error_registro` are not
 * final: the backend reconciles them (they can still become approved, refunded...).
 */
const FINAL_STATUSES: readonly PaymentStatus[] = ['venta_registrada', 'rechazado', 'cancelado', 'reembolsado'];

export function isFinalStatus(estado: PaymentStatus): boolean {
    return FINAL_STATUSES.includes(estado);
}

export function isSuccess(estado: PaymentStatus): boolean {
    return estado === 'venta_registrada';
}

export function paymentPhase(estado: PaymentStatus): PaymentPhase {
    switch (estado) {
        case 'pendiente':
        case 'enviado':
            return 'waiting';
        case 'aprobado':
            return 'registering';
        case 'indeterminado':
            return 'verifying';
        case 'venta_registrada':
            return 'success';
        case 'rechazado':
        case 'cancelado':
            return 'declined';
        case 'error_registro':
        case 'reembolsado':
            return 'refund';
    }
}

const MESSAGES: Record<PaymentPhase, string> = {
    waiting: 'Esperando pago en el Clover…',
    registering: 'Registrando la venta…',
    verifying: 'Verificando el pago…',
    success: 'Pago aprobado',
    declined: 'Pago no aprobado',
    refund: 'No se pudo registrar la venta. El cobro fue reembolsado.',
};

/** Headline shown to the cashier for each payment state. */
export function userMessage(estado: PaymentStatus): string {
    if (estado === 'error_registro') return 'No se pudo registrar la venta. Estamos reembolsando el cobro.';
    return MESSAGES[paymentPhase(estado)];
}

const LABELS: Record<PaymentStatus, string> = {
    pendiente: 'Pendiente',
    enviado: 'Enviado al terminal',
    aprobado: 'Aprobado',
    venta_registrada: 'Venta registrada',
    rechazado: 'Rechazado',
    cancelado: 'Cancelado',
    indeterminado: 'Indeterminado',
    error_registro: 'Error al registrar',
    reembolsado: 'Reembolsado',
};

/** Short label for tables and badges. */
export function statusLabel(estado: PaymentStatus): string {
    return LABELS[estado];
}

/** Card / QR charges go through the terminal only when the integration is enabled. */
export function usesTerminal(method: string, status: TerminalStatus | null | undefined): boolean {
    return !!status?.habilitado && (method === 'Tarjeta' || method === 'QR');
}
