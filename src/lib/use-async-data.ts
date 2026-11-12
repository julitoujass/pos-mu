'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { getErrorMessage } from './errors'

type AsyncState<T> = {
    data: T | undefined
    error: string | null
    /** Token of the last request that finished (success or failure). */
    settled: string | null
}

export type AsyncData<T> = {
    /** Last loaded value; `undefined` until the first successful load. */
    data: T | undefined
    /** First load: there is nothing to show yet (render a skeleton). */
    loading: boolean
    /** Reloading with data on screen: keep showing it with a subtle indicator. */
    refreshing: boolean
    /** Message of the last failed request, cleared while a new one runs. */
    error: string | null
    /** Runs the fetcher again, keeping the current data visible. */
    reload: () => void
    /** Applies a local change to the loaded data (e.g. after a mutation). */
    setData: (updater: (current: T) => T) => void
}

/**
 * Stale-while-revalidate loader shared by the feature hooks.
 *
 * The fetcher runs on mount, whenever `key` changes (filters, page, id...) and
 * on `reload()`. Previous data stays on screen while a new request is in flight
 * (`refreshing`), and responses of superseded requests are ignored.
 */
export function useAsyncData<T>(key: string, fetcher: () => Promise<T>, errorFallback: string): AsyncData<T> {
    const [state, setState] = useState<AsyncState<T>>({ data: undefined, error: null, settled: null })
    const [tick, setTick] = useState(0)
    const token = `${tick}:${key}`

    // Always call the latest fetcher without making it a dependency.
    const fetcherRef = useRef(fetcher)
    useEffect(() => {
        fetcherRef.current = fetcher
    })

    useEffect(() => {
        let cancelled = false
        Promise.resolve()
            .then(() => fetcherRef.current())
            .then(
                data => {
                    if (!cancelled) setState({ data, error: null, settled: token })
                },
                (err: unknown) => {
                    if (cancelled) return
                    const error = getErrorMessage(err, errorFallback)
                    setState(prev => ({ data: prev.data, error, settled: token }))
                },
            )
        return () => {
            cancelled = true
        }
    }, [token, errorFallback])

    const reload = useCallback(() => setTick(n => n + 1), [])

    const setData = useCallback((updater: (current: T) => T) => {
        setState(prev => (prev.data === undefined ? prev : { ...prev, data: updater(prev.data) }))
    }, [])

    const pending = state.settled !== token
    const hasData = state.data !== undefined

    return {
        data: state.data,
        loading: pending && !hasData,
        refreshing: pending && hasData,
        error: pending ? null : state.error,
        reload,
        setData,
    }
}
