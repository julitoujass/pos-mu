'use client'

import { useCallback } from 'react'
import { useAsyncData } from '@/lib/use-async-data'
import { fetchSettings } from '../api'
import type { BusinessSettings } from '../types'

/** Loads the business settings once. Available to every role. */
export function useBusinessSettings() {
    const { data, loading, error, reload, setData } = useAsyncData(
        'business-settings',
        fetchSettings,
        'Error al cargar la configuración',
    )

    /** Swaps in the copy returned by the backend after saving. */
    const setSettings = useCallback((next: BusinessSettings) => setData(() => next), [setData])

    return { settings: data ?? null, setSettings, loading, error, reload }
}
