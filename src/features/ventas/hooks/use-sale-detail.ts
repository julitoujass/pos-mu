'use client'

import { useEffect, useState } from 'react'
import { getErrorMessage } from '@/lib/errors'
import { fetchSaleDetail } from '../api'
import type { SaleDetail } from '../types'

/** Loads one sale's detail; `setSale` lets callers swap in an updated copy (e.g. after cancelling). */
export function useSaleDetail(saleId: string) {
    const [sale, setSale] = useState<SaleDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false
        async function load() {
            setLoading(true)
            setError(null)
            try {
                const data = await fetchSaleDetail(saleId)
                if (!cancelled) setSale(data)
            } catch (err: unknown) {
                if (!cancelled) setError(getErrorMessage(err, 'Error al cargar la venta'))
            } finally {
                if (!cancelled) setLoading(false)
            }
        }
        load()
        return () => { cancelled = true }
    }, [saleId])

    return { sale, setSale, loading, error }
}
