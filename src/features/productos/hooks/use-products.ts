'use client'

import { useCallback, useEffect, useState } from 'react'
import { getErrorMessage } from '@/lib/errors'
import { fetchProducts } from '../api'
import type { Product } from '../types'

/** Loads the product catalog (with variants), optionally filtered by category, and exposes a manual reload. */
export function useProducts(categoriaId?: number) {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const reload = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const data = await fetchProducts(categoriaId)
            setProducts(data)
        } catch (err: unknown) {
            const msg = getErrorMessage(err, 'Error desconocido')
            setError(`Error al cargar productos: ${msg}`)
            console.error(err)
        } finally {
            setLoading(false)
        }
    }, [categoriaId])

    useEffect(() => {
        reload()
    }, [reload])

    return { products, loading, error, reload }
}
