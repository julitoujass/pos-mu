'use client'

import { useCallback, useState } from 'react'
import { useAsyncData } from '@/lib/use-async-data'
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

const NO_SALES: SaleListItem[] = []

function defaultFilters(): HistoryFilters {
    const today = todayInArgentina()
    return { desde: today, hasta: today, metodo_pago: '', estado: '' }
}

/**
 * Filtered, paginated sales list. Changing a filter goes back to the first
 * page; the previous page stays visible while the next one loads (`refreshing`).
 */
export function useSalesHistory() {
    const [filters, setFiltersState] = useState<HistoryFilters>(defaultFilters)
    const [page, setPage] = useState(0)

    const { data, loading, refreshing, error, reload } = useAsyncData(
        JSON.stringify([filters, page]),
        () => fetchSales({
            desde: filters.desde || undefined,
            hasta: filters.hasta || undefined,
            metodo_pago: filters.metodo_pago || undefined,
            estado: filters.estado || undefined,
            limit: HISTORY_PAGE_SIZE,
            offset: page * HISTORY_PAGE_SIZE,
        }),
        'Error al cargar las ventas',
    )

    const setFilters = useCallback((next: HistoryFilters) => {
        setFiltersState(next)
        setPage(0)
    }, [])

    const total = data?.total ?? 0

    return {
        filters,
        setFilters,
        page,
        setPage,
        pageCount: Math.max(1, Math.ceil(total / HISTORY_PAGE_SIZE)),
        sales: data?.items ?? NO_SALES,
        total,
        loading,
        refreshing,
        error,
        reload,
    }
}
