import type { CsvColumn } from '@/lib/csv'
import type { CajaResumenDiario, ProductoTopReporte, VentaDia } from './types'

export const VENTAS_DIA_CSV_COLUMNS: CsvColumn<VentaDia>[] = [
    { header: 'Fecha', value: d => d.fecha },
    { header: 'Ventas', value: d => d.cantidad_ventas },
    { header: 'Bruto', value: d => d.bruto },
    { header: 'Devoluciones', value: d => d.devoluciones },
    { header: 'Neto', value: d => d.total },
]

export const TOP_PRODUCTS_CSV_COLUMNS: CsvColumn<ProductoTopReporte>[] = [
    { header: 'Producto', value: p => p.nombre_producto },
    { header: 'Talle', value: p => p.talle },
    { header: 'Color', value: p => p.color },
    { header: 'Unidades', value: p => p.cantidad_vendida },
    { header: 'Ingresos', value: p => p.ingresos_generados },
]

export const CAJAS_CSV_COLUMNS: CsvColumn<CajaResumenDiario>[] = [
    { header: 'Fecha', value: d => d.fecha },
    { header: 'Sesiones', value: d => d.sesiones_abiertas },
    { header: 'Monto inicial', value: d => d.monto_inicial_total },
    { header: 'Ventas en efectivo', value: d => d.ventas_efectivo ?? 0 },
    { header: 'Ingresos', value: d => d.ingresos },
    { header: 'Egresos', value: d => d.egresos },
    { header: 'Efectivo real', value: d => d.monto_real_efectivo_total },
    { header: 'Diferencia', value: d => d.diferencia_esperado_vs_real },
]
