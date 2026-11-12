'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { fetchCashSessions, fetchSessionMovements } from '../api'
import type { CashMovement, CashStatusResponse } from '../types'

/** Past cash sessions (admin only) and the movements of the selected one. */
export function useSessionsHistory() {
    const [sessions, setSessions] = useState<CashStatusResponse[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedSession, setSelectedSession] = useState<CashStatusResponse | null>(null)
    const [movements, setMovements] = useState<CashMovement[]>([])
    const [loadingMovements, setLoadingMovements] = useState(false)

    useEffect(() => {
        async function load() {
            try {
                const data = await fetchCashSessions()
                // Newest first by opening date
                data.sort((a, b) => new Date(b.fecha_apertura).getTime() - new Date(a.fecha_apertura).getTime())
                setSessions(data)
            } catch {
                toast.error('Error al cargar sesiones')
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    async function selectSession(session: CashStatusResponse) {
        setSelectedSession(session)
        setLoadingMovements(true)
        try {
            const data = await fetchSessionMovements(session.id)
            setMovements(data)
        } catch {
            toast.error('Error al cargar movimientos')
        } finally {
            setLoadingMovements(false)
        }
    }

    function clearSelection() {
        setSelectedSession(null)
    }

    return { sessions, loading, selectedSession, movements, loadingMovements, selectSession, clearSelection }
}
