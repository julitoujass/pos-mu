'use client'

import { useCallback, useState } from 'react'
import { useAsyncData } from '@/lib/use-async-data'
import { useDebouncedValue } from '@/lib/use-debounced-value'
import { fetchAuditLog } from '../api'
import type { AuditEntry } from '../types'

export const AUDIT_PAGE_SIZE = 50

export type AuditFormFilters = {
    desde: string
    hasta: string
    evento: string
    entidad: string
}

const EMPTY_FILTERS: AuditFormFilters = { desde: '', hasta: '', evento: '', entidad: '' }
const NO_ENTRIES: AuditEntry[] = []

/**
 * Filtered, paginated audit log. Changing a filter goes back to the first page.
 * The free-text filters are debounced so typing does not fire a request per key,
 * and the previous page stays visible while the next one loads (`refreshing`).
 */
export function useAuditLog() {
    const [filters, setFiltersState] = useState<AuditFormFilters>(EMPTY_FILTERS)
    const [page, setPage] = useState(0)
    const evento = useDebouncedValue(filters.evento.trim())
    const entidad = useDebouncedValue(filters.entidad.trim())

    const { data, loading, refreshing, error, reload } = useAsyncData(
        JSON.stringify([filters.desde, filters.hasta, evento, entidad, page]),
        () => fetchAuditLog({
            desde: filters.desde || undefined,
            hasta: filters.hasta || undefined,
            evento: evento || undefined,
            entidad: entidad || undefined,
            limit: AUDIT_PAGE_SIZE,
            offset: page * AUDIT_PAGE_SIZE,
        }),
        'Error al cargar la auditoría',
    )

    const setFilters = useCallback((next: AuditFormFilters) => {
        setFiltersState(next)
        setPage(0)
    }, [])

    const total = data?.total ?? 0

    return {
        filters,
        setFilters,
        page,
        setPage,
        pageCount: Math.max(1, Math.ceil(total / AUDIT_PAGE_SIZE)),
        entries: data?.items ?? NO_ENTRIES,
        total,
        loading,
        refreshing,
        error,
        reload,
    }
}
