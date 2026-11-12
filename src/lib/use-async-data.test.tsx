// @vitest-environment jsdom
import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useAsyncData } from './use-async-data'

function deferred<T>() {
    let resolve!: (value: T) => void
    const promise = new Promise<T>(res => {
        resolve = res
    })
    return { promise, resolve }
}

describe('useAsyncData', () => {
    it('reports loading on the first load and then exposes the data', async () => {
        const first = deferred<string[]>()
        const { result } = renderHook(() => useAsyncData('k', () => first.promise, 'fallo'))

        expect(result.current.loading).toBe(true)
        expect(result.current.refreshing).toBe(false)
        expect(result.current.data).toBeUndefined()

        await act(async () => first.resolve(['a']))

        expect(result.current.loading).toBe(false)
        expect(result.current.data).toEqual(['a'])
    })

    it('keeps the previous data visible while reloading', async () => {
        const second = deferred<string>()
        const fetcher = vi.fn<() => Promise<string>>().mockResolvedValueOnce('old').mockReturnValueOnce(second.promise)
        const { result } = renderHook(() => useAsyncData('k', fetcher, 'fallo'))
        await waitFor(() => expect(result.current.data).toBe('old'))

        act(() => result.current.reload())

        expect(result.current.refreshing).toBe(true)
        expect(result.current.loading).toBe(false)
        expect(result.current.data).toBe('old')

        await act(async () => second.resolve('new'))

        expect(result.current.refreshing).toBe(false)
        expect(result.current.data).toBe('new')
    })

    it('refetches when the key changes and ignores the superseded response', async () => {
        const slow = deferred<string>()
        const fast = deferred<string>()
        const fetcher = vi.fn((key: string) => (key === 'a' ? slow.promise : fast.promise))
        const { result, rerender } = renderHook(({ k }) => useAsyncData(k, () => fetcher(k), 'fallo'), {
            initialProps: { k: 'a' },
        })

        rerender({ k: 'b' })
        await act(async () => fast.resolve('from-b'))
        await act(async () => slow.resolve('from-a'))

        expect(result.current.data).toBe('from-b')
        expect(fetcher).toHaveBeenCalledTimes(2)
    })

    it('exposes the error of a failed first load and recovers on reload', async () => {
        const fetcher = vi.fn<() => Promise<string>>()
            .mockRejectedValueOnce(new Error('sin conexión'))
            .mockResolvedValueOnce('ok')
        const { result } = renderHook(() => useAsyncData('k', fetcher, 'fallo'))

        await waitFor(() => expect(result.current.error).toBe('sin conexión'))
        expect(result.current.loading).toBe(false)
        expect(result.current.data).toBeUndefined()

        act(() => result.current.reload())
        expect(result.current.error).toBeNull()
        expect(result.current.loading).toBe(true)

        await waitFor(() => expect(result.current.data).toBe('ok'))
        expect(result.current.error).toBeNull()
    })

    it('keeps the data when a refresh fails', async () => {
        const fetcher = vi.fn<() => Promise<string>>()
            .mockResolvedValueOnce('old')
            .mockRejectedValueOnce(new Error('boom'))
        const { result } = renderHook(() => useAsyncData('k', fetcher, 'fallo'))
        await waitFor(() => expect(result.current.data).toBe('old'))

        act(() => result.current.reload())

        await waitFor(() => expect(result.current.error).toBe('boom'))
        expect(result.current.data).toBe('old')
        expect(result.current.refreshing).toBe(false)
    })

    it('applies local updates with setData', async () => {
        const { result } = renderHook(() => useAsyncData('k', () => Promise.resolve([1]), 'fallo'))
        await waitFor(() => expect(result.current.data).toEqual([1]))

        act(() => result.current.setData(prev => [...prev, 2]))

        expect(result.current.data).toEqual([1, 2])
    })
})
