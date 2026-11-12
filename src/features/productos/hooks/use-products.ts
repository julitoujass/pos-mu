'use client'

import { useAsyncData } from '@/lib/use-async-data'
import { fetchProducts } from '../api'
import type { Product } from '../types'

const NO_PRODUCTS: Product[] = []

/**
 * Loads the product catalog (with variants), optionally filtered by category.
 * `reload()` and category changes keep the current list visible (`refreshing`).
 */
export function useProducts(categoriaId?: number) {
    const { data, loading, refreshing, error, reload } = useAsyncData(
        `products:${categoriaId ?? ''}`,
        () => fetchProducts(categoriaId),
        'Error al cargar productos',
    )

    return { products: data ?? NO_PRODUCTS, loading, refreshing, error, reload }
}
