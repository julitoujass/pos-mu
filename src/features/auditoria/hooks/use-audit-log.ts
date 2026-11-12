'use client'

import { useCallback, useEffect, useState } from 'react'
import { getErrorMessage } from '@/lib/errors'
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

/** Filtered, paginated audit log. Changing a filter goes back to the first page. */
export function useAuditLog() {
    const [filters, setFiltersState] = useState<AuditFormFilters>(EMPTY_FILTERS)
    const [page, setPage] = useState(0)
    const [entries, setEntries] = useState<AuditEntry[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false
        async function load() {
            setLoading(true)
            setError(null)
            try {
                const data = await fetchAuditLog({
                    desde: filters.desde || undefined,
                    hasta: filters.hasta || undefined,
                    evento: filters.evento.trim() || undefined,
                    entidad: filters.entidad.trim() || undefined,
                    limit: AUDIT_PAGE_SIZE,
                    offset: page * AUDIT_PAGE_SIZE,
                })
                if (cancelled) return
                setEntries(data.items)
                setTotal(data.total)
            } catch (err: unknown) {
                if (!cancelled) setError(getErrorMessage(err, 'Error al cargar la auditoría'))
            } finally {
                if (!cancelled) setLoading(false)
            }
        }
        load()
        return () => { cancelled = true }
    }, [filters, page])

    const setFilters = useCallback((next: AuditFormFilters) => {
        setFiltersState(next)
        setPage(0)
    }, [])

    return {
        filters,
        setFilters,
        page,
        setPage,
        pageCount: Math.max(1, Math.ceil(total / AUDIT_PAGE_SIZE)),
        entries,
        total,
        loading,
        error,
    }
}
