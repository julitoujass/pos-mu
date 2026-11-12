import { apiJson, toQueryString } from '@/lib/http';
import type {
    PaymentsFilters,
    PaymentsPage,
    TerminalPayment,
    TerminalPaymentCreate,
    TerminalPaymentStart,
    TerminalSettingsUpdate,
    TerminalStatus,
} from './types';

/** Whether the terminal integration is enabled and reachable. Any role. */
export function fetchTerminalStatus(): Promise<TerminalStatus> {
    return apiJson('/integraciones/terminal', 'Failed to fetch terminal status');
}

/** Admin only. Partial update of the terminal integration. */
export function updateTerminalSettings(data: TerminalSettingsUpdate): Promise<TerminalStatus> {
    return apiJson('/integraciones/terminal', 'Failed to update terminal settings', { method: 'PATCH', body: data });
}

/** Starts a charge on the terminal (202). The sale is registered once it is approved. */
export function startTerminalPayment(data: TerminalPaymentCreate): Promise<TerminalPaymentStart> {
    return apiJson('/pagos/terminal', 'Failed to start terminal payment', { method: 'POST', body: data });
}

export function fetchPayment(id: string): Promise<TerminalPayment> {
    return apiJson(`/pagos/${id}`, 'Failed to fetch payment');
}

/** Asks the terminal to cancel; the final state still arrives by polling. */
export function cancelPayment(id: string): Promise<TerminalPayment> {
    return apiJson(`/pagos/${id}/cancelar`, 'Failed to cancel payment', { method: 'POST' });
}

/** Admin only. Payments filtered by state, newest first. */
export function fetchPayments(filters: PaymentsFilters = {}): Promise<PaymentsPage> {
    const { estado, limit, offset } = filters;
    const query = toQueryString({
        estado,
        limit: limit === undefined ? undefined : String(limit),
        offset: offset === undefined ? undefined : String(offset),
    });
    return apiJson(`/pagos/${query}`, 'Failed to fetch payments');
}

/** Admin only. Asks the provider for the real outcome of an unresolved payment. */
export function reconcilePayment(id: string): Promise<TerminalPayment> {
    return apiJson(`/pagos/${id}/conciliar`, 'Failed to reconcile payment', { method: 'POST' });
}
