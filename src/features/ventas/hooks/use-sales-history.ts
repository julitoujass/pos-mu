'use client'

import { useCallback, useEffect, useState } from 'react'
import { getErrorMessage } from '@/lib/errors'
import { fetchSales } from '../api'
import { todayInArgentina } from '../dates'
import type { PaymentMethod, SaleListItem, SaleStatus } from '../types'

export const HISTORY_PAGE_SIZE = 50

export type HistoryFilters = {
    desde: string
    hasta: string
    metodo_pago: PaymentMethod | ''
    estado: SaleStatus | ''
}

function defaultFilters(): HistoryFilters {
    const today = todayInArgentina()
    return { desde: today, hasta: today, metodo_pago: '', estado: '' }
}

/** Filtered, paginated sales list. Changing a filter goes back to the first page. */
export function useSalesHistory() {
    const [filters, setFiltersState] = useState<HistoryFilters>(defaultFilters)
    const [page, setPage] = useState(0)
    const [sales, setSales] = useState<SaleListItem[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [refreshTrigger, setRefreshTrigger] = useState(0)

    useEffect(() => {
        let cancelled = false
        async function load() {
            setLoading(true)
            setError(null)
            try {
                const data = await fetchSales({
                    desde: filters.desde || undefined,
                    hasta: filters.hasta || undefined,
                    metodo_pago: filters.metodo_pago || undefined,
                    estado: filters.estado || undefined,
                    limit: HISTORY_PAGE_SIZE,
                    offset: page * HISTORY_PAGE_SIZE,
                })
                if (cancelled) return
                setSales(data.items)
                setTotal(data.total)
            } catch (err: unknown) {
                if (!cancelled) setError(getErrorMessage(err, 'Error al cargar las ventas'))
            } finally {
                if (!cancelled) setLoading(false)
            }
        }
        load()
        return () => { cancelled = true }
    }, [filters, page, refreshTrigger])

    const setFilters = useCallback((next: HistoryFilters) => {
        setFiltersState(next)
        setPage(0)
    }, [])

    const reload = useCallback(() => setRefreshTrigger(n => n + 1), [])

    return {
        filters,
        setFilters,
        page,
        setPage,
        pageCount: Math.max(1, Math.ceil(total / HISTORY_PAGE_SIZE)),
        sales,
        total,
        loading,
        error,
        reload,
    }
}
