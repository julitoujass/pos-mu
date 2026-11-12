'use client'

import { useEffect, useState } from 'react'
import { getErrorMessage } from '@/lib/errors'
import { fetchClients } from '../api'
import type { Client } from '../types'

/** Loads clients; `load(query)` runs the server-side search. */
export function useClients() {
    const [clients, setClients] = useState<Client[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    async function load(query?: string) {
        try {
            setLoading(true)
            const data = await fetchClients(query)
            setClients(data)
        } catch (err: unknown) {
            setError(getErrorMessage(err, 'Error al cargar clientes'))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        load()
    }, [])

    return { clients, loading, error, load }
}
