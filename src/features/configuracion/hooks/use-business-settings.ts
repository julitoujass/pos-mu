'use client'

import { useEffect, useState } from 'react'
import { getErrorMessage } from '@/lib/errors'
import { fetchSettings } from '../api'
import type { BusinessSettings } from '../types'

/** Loads the business settings once. Available to every role. */
export function useBusinessSettings() {
    const [settings, setSettings] = useState<BusinessSettings | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false
        async function load() {
            try {
                const data = await fetchSettings()
                if (!cancelled) setSettings(data)
            } catch (err: unknown) {
                if (!cancelled) setError(getErrorMessage(err, 'Error al cargar la configuración'))
            } finally {
                if (!cancelled) setLoading(false)
            }
        }
        load()
        return () => { cancelled = true }
    }, [])

    return { settings, setSettings, loading, error }
}
