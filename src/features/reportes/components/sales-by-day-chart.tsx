import { TrendingUp } from 'lucide-react'
import { formatDayMonth, formatWholeMoney } from '../format'
import type { VentasTotalesReporte } from '../types'
import { ChartEmptyState } from './report-states'

const BAR_AREA_HEIGHT = 140

/** Bar height in px; non-zero values keep a 2px minimum so tiny days stay visible. */
function barHeight(value: number, max: number): number {
    if (value <= 0) return 0
    return Math.max((value / max) * BAR_AREA_HEIGHT, 2)
}

/** Net sales (brand) next to returns (red) per day. */
export function SalesByDayChart({ ventas }: { ventas: VentasTotalesReporte | null }) {
    const days = ventas?.ventas_por_dia ?? []
    const max = Math.max(...days.map(d => Math.max(d.total, d.devoluciones ?? 0)), 1)

    return (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <TrendingUp size={20} className="text-brand" />
                    Ventas por Día
                </h2>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-brand" />Neto</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-red-500" />Devoluciones</span>
                </div>
            </div>
            {days.length === 0 ? (
                <ChartEmptyState label="Sin ventas en el período seleccionado" />
            ) : (
                <div className="overflow-x-auto pb-2">
                    <div className="flex items-end gap-2 min-w-max">
                        {days.map(d => {
                            const devoluciones = d.devoluciones ?? 0
                            return (
                                <div
                                    key={d.fecha}
                                    className="flex flex-col items-center gap-1 group"
                                    style={{ minWidth: 56 }}
                                    title={`Neto ${formatWholeMoney(d.total)} · Devoluciones ${formatWholeMoney(devoluciones)}`}
                                >
                                    <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-medium">
                                        {formatWholeMoney(d.total)}
                                    </span>
                                    <div className="flex items-end gap-1" style={{ height: BAR_AREA_HEIGHT }}>
                                        <div
                                            className="w-5 bg-gradient-to-t from-brand to-brand/60 rounded-t-md transition-all duration-500"
                                            style={{ height: barHeight(d.total, max) }}
                                        />
                                        <div
                                            className="w-5 bg-red-500 rounded-t-md transition-all duration-500"
                                            style={{ height: barHeight(devoluciones, max) }}
                                        />
                                    </div>
                                    <span className="text-xs text-muted-foreground">{formatDayMonth(d.fecha)}</span>
                                    <span className="text-xs font-bold text-foreground">{d.cantidad_ventas}</span>
                                </div>
                            )
                        })}
                    </div>
                    <p className="text-xs text-muted-foreground mt-3 text-center">El número bajo cada par de barras indica cantidad de ventas</p>
                </div>
            )}
        </div>
    )
}
