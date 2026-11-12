'use client'

import { useAsyncData } from '@/lib/use-async-data'
import { fetchReporteCajas, fetchReporteProductosTop, fetchReporteVentas } from '../api'
import type { ProductoTopReporte } from '../types'

const NO_PRODUCTS: ProductoTopReporte[] = []

/**
 * Loads the three reports for a date range and reloads when the range changes,
 * keeping the previous figures visible meanwhile (`refreshing`).
 */
export function useReportes(fechaInicio: string, fechaFin: string) {
    const { data, loading, refreshing, error, reload } = useAsyncData(
        `reportes:${fechaInicio}:${fechaFin}`,
        async () => {
            const [ventas, topProductos, cajas] = await Promise.all([
                fetchReporteVentas(fechaInicio, fechaFin),
                // A failing top-products endpoint degrades to an empty list.
                fetchReporteProductosTop(fechaInicio, fechaFin).catch(() => NO_PRODUCTS),
                fetchReporteCajas(fechaInicio, fechaFin),
            ])
            return { ventas, topProductos, cajas }
        },
        'Error al cargar reportes',
    )

    return {
        ventas: data?.ventas ?? null,
        topProductos: data?.topProductos ?? NO_PRODUCTS,
        cajas: data?.cajas ?? null,
        loading,
        refreshing,
        error,
        reload,
    }
}
