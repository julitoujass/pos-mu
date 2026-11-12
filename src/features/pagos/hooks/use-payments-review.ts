'use client'

import { useCallback, useState } from 'react'
import { useAsyncData } from '@/lib/use-async-data'
import { fetchPayments } from '../api'
import { filterToStatuses, mergePages, type ReviewFilter } from '../review-filters'
import type { PaymentsPage } from '../types'

export const PAYMENTS_PAGE_SIZE = 50

const NO_PAYMENTS: PaymentsPage['items'] = []

/**
 * Payments for the admin review screen. "A revisar" merges the unresolved states
 * in a single list (no pagination); the other filters are paginated.
 */
export function usePaymentsReview() {
    const [filter, setFilterState] = useState<ReviewFilter>('revision')
    const [page, setPage] = useState(0)
    const paginated = filter !== 'revision'

    const { data, loading, refreshing, error, reload } = useAsyncData(
        JSON.stringify([filter, paginated ? page : 0]),
        async () => {
            const pages = await Promise.all(
                filterToStatuses(filter).map(estado =>
                    fetchPayments({
                        estado,
                        limit: PAYMENTS_PAGE_SIZE,
                        offset: paginated ? page * PAYMENTS_PAGE_SIZE : 0,
                    }),
                ),
            )
            return mergePages(pages)
        },
        'Error al cargar los pagos',
    )

    const setFilter = useCallback((next: ReviewFilter) => {
        setFilterState(next)
        setPage(0)
    }, [])

    const total = data?.total ?? 0
    return {
        filter,
        setFilter,
        page,
        setPage,
        paginated,
        pageCount: Math.max(1, Math.ceil(total / PAYMENTS_PAGE_SIZE)),
        payments: data?.items ?? NO_PAYMENTS,
        total,
        loading,
        refreshing,
        error,
        reload,
    }
}
