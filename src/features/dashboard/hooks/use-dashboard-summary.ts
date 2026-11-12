'use client'

import { useEffect, useState } from 'react'
import { fetchCashStatus, type CashStatusResponse } from '@/features/caja'
import { fetchLowStock } from '@/features/productos'
import { fetchSalesToday, type SaleResponse } from '@/features/ventas'

/** Today's sales and the current cash session; each request degrades on its own. */
export function useDashboardSummary() {
    const [salesToday, setSalesToday] = useState<SaleResponse[]>([])
    const [cashStatus, setCashStatus] = useState<CashStatusResponse | null>(null)
    const [lowStockCount, setLowStockCount] = useState<number | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function loadData() {
            try {
                const [salesData, cashData, lowStock] = await Promise.all([
                    fetchSalesToday().catch(() => []),
                    fetchCashStatus().catch(() => null),
                    fetchLowStock().catch(() => null),
                ])
                setSalesToday(salesData)
                setCashStatus(cashData)
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

    return { salesToday, cashStatus, lowStockCount, loading, error }
}
