'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/errors'
import { fetchCashMovements, fetchCashStatus, fetchCashSummary } from '../api'
import type { CashMovement, CashStatusResponse, CashSummary } from '../types'

/**
 * Loads the current cash session. Movements and the backend summary are only
 * requested while the register is open. Call `refresh()` after any mutation.
 */
export function useCashSession() {
    const [cashStatus, setCashStatus] = useState<CashStatusResponse | null>(null)
    const [movements, setMovements] = useState<CashMovement[]>([])
    const [summary, setSummary] = useState<CashSummary | null>(null)
    const [loading, setLoading] = useState(true)
    const [refreshTrigger, setRefreshTrigger] = useState(0)

    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true)
                const status = await fetchCashStatus()
                setCashStatus(status)

                if (status?.estado === 'abierta') {
                    const [movs, summaryData] = await Promise.all([
                        fetchCashMovements(),
                        fetchCashSummary()
                    ])
                    setMovements(movs)
                    setSummary(summaryData)
                } else {
                    setMovements([])
                    setSummary(null)
                }
            } catch (err: unknown) {
                toast.error(getErrorMessage(err, 'Error al cargar los datos de caja'))
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [refreshTrigger])

    function refresh() {
        setRefreshTrigger(p => p + 1)
    }

    return { cashStatus, movements, summary, loading, refresh }
}
