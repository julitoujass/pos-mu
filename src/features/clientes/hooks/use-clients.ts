'use client'

import { useAsyncData } from '@/lib/use-async-data'
import { fetchClients } from '../api'
import type { Client } from '../types'

const NO_CLIENTS: Client[] = []

/**
 * Loads clients with the server-side search `query` (pass it already debounced).
 * A new query or `reload()` keeps the previous results visible (`refreshing`).
 */
export function useClients(query = '') {
    const term = query.trim()
    const { data, loading, refreshing, error, reload } = useAsyncData(
        `clients:${term}`,
        () => fetchClients(term || undefined),
        'Error al cargar clientes',
    )

    return { clients: data ?? NO_CLIENTS, loading, refreshing, error, reload }
}
