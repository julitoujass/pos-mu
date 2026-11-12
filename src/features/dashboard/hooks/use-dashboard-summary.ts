'use client'

import { useEffect, useState } from 'react'
import { fetchCashStatus, fetchCashSummary, type CashStatusResponse, type CashSummary } from '@/features/caja'
import { fetchLowStock } from '@/features/productos'
import { fetchSalesToday, type SaleResponse } from '@/features/ventas'

/** Today's sales and the current cash session; each request degrades on its own. */
export function useDashboardSummary() {
    const [salesToday, setSalesToday] = useState<SaleResponse[]>([])
    const [cashStatus, setCashStatus] = useState<CashStatusResponse | null>(null)
    const [cashSummary, setCashSummary] = useState<CashSummary | null>(null)
    const [lowStockCount, setLowStockCount] = useState<number | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function loadData() {
            try {
                const [salesData, cashData, summaryData, lowStock] = await Promise.all([
                    fetchSalesToday().catch(() => []),
                    fetchCashStatus().catch(() => null),
                    fetchCashSummary().catch(() => null),
                    fetchLowStock().catch(() => null),
                ])
                setSalesToday(salesData)
                setCashStatus(cashData)
                setCashSummary(summaryData)
                setLowStockCount(lowStock?.total ?? null)
            } catch (err) {
                setError('Error al cargar datos del dashboard')
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [])

    return { salesToday, cashStatus, cashSummary, lowStockCount, loading, error }
}
