import { apiJson } from '@/lib/http';
import type {
    CashClose,
    CashMovement,
    CashMovementCreate,
    CashOpen,
    CashStatusResponse,
    CashSummary,
} from './types';

export function fetchCashStatus(): Promise<CashStatusResponse | null> {
    return apiJson('/caja/estado', 'Failed to fetch cash status');
}

/** Resolves to null when there is no open session. */
export function fetchCashSummary(): Promise<CashSummary | null> {
    return apiJson('/caja/resumen', 'Failed to fetch cash summary');
}

export function openRegister(data: CashOpen): Promise<CashStatusResponse> {
    // Only the amount is sent: the backend takes the user from the token.
    return apiJson('/caja/apertura', 'Error opening register', {
        method: 'POST',
        body: { monto_apertura: data.monto_apertura },
    });
}

export function closeRegister(data: CashClose): Promise<CashStatusResponse> {
    return apiJson('/caja/cierre', 'Error closing register', { method: 'POST', body: data });
}

export function fetchCashMovements(): Promise<CashMovement[]> {
    return apiJson('/caja/movimientos', 'Failed to fetch movements');
}

export function createCashMovement(data: CashMovementCreate): Promise<CashMovement> {
    return apiJson('/caja/movimiento', 'Error creating movement', { method: 'POST', body: data });
}

// ---- Session history (admin only) ----

export function fetchCashSessions(): Promise<CashStatusResponse[]> {
    return apiJson('/caja/sesiones', 'Failed to fetch cash sessions');
}

export function fetchSessionMovements(sesionId: string): Promise<CashMovement[]> {
    return apiJson(`/caja/sesiones/${sesionId}/movimientos`, 'Failed to fetch session movements');
}
