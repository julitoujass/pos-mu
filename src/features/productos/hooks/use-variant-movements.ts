'use client'

import { useEffect, useState } from 'react'
import { getErrorMessage } from '@/lib/errors'
import { fetchVariantMovements } from '../api'
import type { StockMovement } from '../types'

export const MOVEMENTS_PAGE_SIZE = 50

/** Paginated stock ledger (kardex) of one variant. */
export function useVariantMovements(variantId: string) {
    const [page, setPage] = useState(0)
    const [movements, setMovements] = useState<StockMovement[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false
        async function load() {
            setLoading(true)
            setError(null)
            try {
                const data = await fetchVariantMovements(variantId, {
                    limit: MOVEMENTS_PAGE_SIZE,
                    offset: page * MOVEMENTS_PAGE_SIZE,
                })
                if (cancelled) return
                setMovements(data.items)
                setTotal(data.total)
            } catch (err: unknown) {
                if (!cancelled) setError(getErrorMessage(err, 'Error al cargar los movimientos'))
            } finally {
                if (!cancelled) setLoading(false)
            }
        }
        load()
        return () => { cancelled = true }
    }, [variantId, page])

    return {
        page,
        setPage,
        pageCount: Math.max(1, Math.ceil(total / MOVEMENTS_PAGE_SIZE)),
        movements,
        total,
        loading,
        error,
    }
}
