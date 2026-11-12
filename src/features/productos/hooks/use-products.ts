'use client'

import { useEffect, useState } from 'react'
import { getErrorMessage } from '@/lib/errors'
import { fetchProducts } from '../api'
import type { Product } from '../types'

/** Loads the product catalog (with variants) and exposes a manual reload. */
export function useProducts() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    async function reload() {
        try {
            setLoading(true)
            const data = await fetchProducts()
            setProducts(data)
        } catch (err: unknown) {
            const msg = getErrorMessage(err, 'Error desconocido')
            setError(`Error al cargar productos: ${msg}`)
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        reload()
    }, [])

    return { products, loading, error, reload }
}
