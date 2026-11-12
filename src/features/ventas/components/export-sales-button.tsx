'use client'

import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { downloadCsv, toCsv } from '@/lib/csv'
import { getErrorMessage } from '@/lib/errors'
import { SALES_CSV_COLUMNS, fetchAllSales } from '../export'
import type { HistoryFilters } from '../hooks/use-sales-history'

/** Downloads every sale matching the current history filters as CSV. */
export function ExportSalesButton({ filters }: { filters: HistoryFilters }) {
    const [loading, setLoading] = useState(false)

    async function handleExport() {
        setLoading(true)
        try {
            const sales = await fetchAllSales({
                desde: filters.desde || undefined,
                hasta: filters.hasta || undefined,
                metodo_pago: filters.metodo_pago || undefined,
                estado: filters.estado || undefined,
            })
            if (sales.length === 0) {
                toast.info('No hay ventas para exportar')
                return
            }
            const range = [filters.desde, filters.hasta].filter(Boolean).join('_')
            downloadCsv(`ventas${range ? `_${range}` : ''}.csv`, toCsv(sales, SALES_CSV_COLUMNS))
            toast.success(`${sales.length} ventas exportadas`)
        } catch (err: unknown) {
            toast.error(getErrorMessage(err, 'Error al exportar las ventas'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handleExport}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-xl text-sm font-medium hover:bg-muted/80 transition-colors disabled:opacity-50 self-start sm:self-auto"
        >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            Exportar CSV
        </button>
    )
}
