'use client'

import { useState } from 'react'
import { useAsyncData } from '@/lib/use-async-data'
import { fetchVariantMovements } from '../api'
import type { StockMovement } from '../types'

export const MOVEMENTS_PAGE_SIZE = 50

const NO_MOVEMENTS: StockMovement[] = []

/** Paginated stock ledger (kardex) of one variant; the previous page stays visible while the next loads. */
export function useVariantMovements(variantId: string) {
    const [page, setPage] = useState(0)

    const { data, loading, refreshing, error, reload } = useAsyncData(
        `movements:${variantId}:${page}`,
        () => fetchVariantMovements(variantId, {
            limit: MOVEMENTS_PAGE_SIZE,
            offset: page * MOVEMENTS_PAGE_SIZE,
        }),
        'Error al cargar los movimientos',
    )

    const total = data?.total ?? 0

    return {
        page,
        setPage,
        pageCount: Math.max(1, Math.ceil(total / MOVEMENTS_PAGE_SIZE)),
        movements: data?.items ?? NO_MOVEMENTS,
        total,
        loading,
        refreshing,
        error,
        reload,
    }
}
