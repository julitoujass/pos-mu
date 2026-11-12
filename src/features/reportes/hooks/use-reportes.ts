'use client'

import { useCallback, useEffect, useState } from 'react'
import { getErrorMessage } from '@/lib/errors'
import { fetchReporteCajas, fetchReporteProductosTop, fetchReporteVentas } from '../api'
import type { CajaResumenReporte, ProductoTopReporte, VentasTotalesReporte } from '../types'

/** Loads the three reports for a date range and reloads when the range changes. */
export function useReportes(fechaInicio: string, fechaFin: string) {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [ventas, setVentas] = useState<VentasTotalesReporte | null>(null)
    const [topProductos, setTopProductos] = useState<ProductoTopReporte[]>([])
    const [cajas, setCajas] = useState<CajaResumenReporte | null>(null)

    const reload = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const [v, tp, c] = await Promise.all([
                fetchReporteVentas(fechaInicio, fechaFin),
                // A failing top-products endpoint degrades to an empty list.
                fetchReporteProductosTop(fechaInicio, fechaFin).catch(() => []),
                fetchReporteCajas(fechaInicio, fechaFin)
            ])
            setVentas(v)
            setTopProductos(tp)
            setCajas(c)
        } catch (err: unknown) {
            setError(getErrorMessage(err, 'Error al cargar reportes'))
        } finally {
            setLoading(false)
        }
    }, [fechaInicio, fechaFin])

    useEffect(() => { reload() }, [reload])

    return { ventas, topProductos, cajas, loading, error, reload }
}
