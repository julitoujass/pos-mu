import { apiJson, toQueryString } from '@/lib/http';
import type { AuditFilters, AuditPage } from './types';

/** Admin only. Paginated audit log; empty filters are skipped. */
export function fetchAuditLog(filters: AuditFilters = {}): Promise<AuditPage> {
    const { limit, offset, ...rest } = filters;
    const query = toQueryString({
        ...rest,
        limit: limit === undefined ? undefined : String(limit),
        offset: offset === undefined ? undefined : String(offset),
    });
    return apiJson(`/auditoria/${query}`, 'Failed to fetch audit log');
}
