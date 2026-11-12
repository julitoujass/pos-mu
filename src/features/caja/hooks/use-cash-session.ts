'use client'

import { useAsyncData } from '@/lib/use-async-data'
import { fetchCashMovements, fetchCashStatus, fetchCashSummary } from '../api'
import type { CashMovement, CashStatusResponse, CashSummary } from '../types'

type CashSession = {
    cashStatus: CashStatusResponse | null
    movements: CashMovement[]
    summary: CashSummary | null
}

const NO_MOVEMENTS: CashMovement[] = []

async function loadCashSession(): Promise<CashSession> {
    const cashStatus = await fetchCashStatus()
    if (cashStatus?.estado !== 'abierta') {
        return { cashStatus, movements: [], summary: null }
    }
    const [movements, summary] = await Promise.all([fetchCashMovements(), fetchCashSummary()])
    return { cashStatus, movements, summary }
}

/**
 * Loads the current cash session. Movements and the backend summary are only
 * requested while the register is open. Call `refresh()` after any mutation:
 * the current figures stay on screen while they reload (`refreshing`).
 */
export function useCashSession() {
    const { data, loading, refreshing, error, reload } = useAsyncData(
        'cash-session',
        loadCashSession,
        'Error al cargar los datos de caja',
    )

    return {
        cashStatus: data?.cashStatus ?? null,
        movements: data?.movements ?? NO_MOVEMENTS,
        summary: data?.summary ?? null,
        loading,
        refreshing,
        error,
        refresh: reload,
    }
}
