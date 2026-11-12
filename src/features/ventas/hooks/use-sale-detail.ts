'use client'

import { useCallback } from 'react'
import { useAsyncData } from '@/lib/use-async-data'
import { fetchSaleDetail } from '../api'
import type { SaleDetail } from '../types'

/** Loads one sale's detail; `setSale` lets callers swap in an updated copy (e.g. after cancelling). */
export function useSaleDetail(saleId: string) {
    const { data, loading, error, reload, setData } = useAsyncData(
        `sale:${saleId}`,
        () => fetchSaleDetail(saleId),
        'Error al cargar la venta',
    )

    const setSale = useCallback((next: SaleDetail) => setData(() => next), [setData])

    return { sale: data ?? null, setSale, loading, error, reload }
}
