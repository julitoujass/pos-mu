'use client'

import { Download } from 'lucide-react'
import { toast } from 'sonner'
import { downloadCsv, toCsv, type CsvColumn } from '@/lib/csv'
import { CAJAS_CSV_COLUMNS, TOP_PRODUCTS_CSV_COLUMNS, VENTAS_DIA_CSV_COLUMNS } from '../export'
import type { CajaResumenReporte, ProductoTopReporte, VentasTotalesReporte } from '../types'

type ExportButtonsProps = {
    ventas: VentasTotalesReporte | null
    topProductos: ProductoTopReporte[]
    cajas: CajaResumenReporte | null
    fechaInicio: string
    fechaFin: string
}

/** CSV downloads of the data already loaded in the report page. */
export function ExportButtons({ ventas, topProductos, cajas, fechaInicio, fechaFin }: ExportButtonsProps) {
    function exportRows<T>(name: string, rows: T[], columns: CsvColumn<T>[]) {
        if (rows.length === 0) {
            toast.info('No hay datos para exportar en el período')
            return
        }
        downloadCsv(`${name}_${fechaInicio}_${fechaFin}.csv`, toCsv(rows, columns))
    }

    const buttonClass =
        'flex items-center gap-2 px-3 py-2 bg-muted text-foreground rounded-xl text-sm font-medium hover:bg-muted/80 transition-colors'

    return (
        <div className="flex flex-wrap items-center gap-2" aria-label="Exportar a CSV" role="group">
            <span className="text-sm text-muted-foreground">Exportar CSV:</span>
            <button className={buttonClass} onClick={() => exportRows('ventas-por-dia', ventas?.ventas_por_dia ?? [], VENTAS_DIA_CSV_COLUMNS)}>
                <Download size={14} /> Ventas por día
            </button>
            <button className={buttonClass} onClick={() => exportRows('productos-top', topProductos, TOP_PRODUCTS_CSV_COLUMNS)}>
                <Download size={14} /> Productos top
            </button>
            <button className={buttonClass} onClick={() => exportRows('cajas', cajas?.resumen_diario ?? [], CAJAS_CSV_COLUMNS)}>
                <Download size={14} /> Cajas
            </button>
        </div>
    )
}
