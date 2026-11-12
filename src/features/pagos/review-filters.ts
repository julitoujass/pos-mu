import { isFinalStatus, statusLabel } from './payment-states';
import type { PaymentStatus, PaymentsPage } from './types';

/** "Pagos a revisar" filter: the unresolved states, one state, or everything. */
export type ReviewFilter = 'revision' | 'todos' | PaymentStatus;

export const REVIEW_STATUSES: readonly PaymentStatus[] = ['indeterminado', 'error_registro'];

const STATUS_OPTIONS: PaymentStatus[] = [
    'pendiente',
    'enviado',
    'aprobado',
    'venta_registrada',
    'rechazado',
    'cancelado',
    'indeterminado',
    'error_registro',
    'reembolsado',
];

export const FILTER_OPTIONS: { value: ReviewFilter; label: string }[] = [
    { value: 'revision', label: 'A revisar' },
    ...STATUS_OPTIONS.map(value => ({ value, label: statusLabel(value) })),
    { value: 'todos', label: 'Todos' },
];

/** States to request for a filter (`undefined` = no state filter). */
export function filterToStatuses(filter: ReviewFilter): (PaymentStatus | undefined)[] {
    if (filter === 'revision') return [...REVIEW_STATUSES];
    if (filter === 'todos') return [undefined];
    return [filter];
}

/** Combines the pages of several requests: newest first, totals added. */
export function mergePages(pages: PaymentsPage[]): PaymentsPage {
    const items = pages
        .flatMap(page => page.items)
        .sort((a, b) => b.created_at.localeCompare(a.created_at));
    return { items, total: pages.reduce((sum, page) => sum + page.total, 0) };
}

/** Only unresolved payments can still change by asking the provider. */
export function canReconcile(estado: PaymentStatus): boolean {
    return !isFinalStatus(estado);
}
