'use client'

import { useAsyncData } from '@/lib/use-async-data'
import { fetchTerminalStatus } from '../api'

/** Terminal integration status (enabled / connected). Available to every role. */
export function useTerminalStatus() {
    const { data, loading, error, reload } = useAsyncData(
        'terminal-status',
        fetchTerminalStatus,
        'Error al cargar el estado del terminal',
    )
    return { status: data ?? null, loading, error, reload }
}
