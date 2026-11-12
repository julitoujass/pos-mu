import { TrendingUp } from 'lucide-react'
import { formatDayMonth, formatWholeMoney } from '../format'
import type { VentasTotalesReporte } from '../types'
import { ChartEmptyState } from './report-states'

export function SalesByDayChart({ ventas }: { ventas: VentasTotalesReporte | null }) {
    const maxVentaDia = ventas ? Math.max(...ventas.ventas_por_dia.map(d => d.total), 1) : 1

    return (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                <TrendingUp size={20} className="text-brand" />
                Ventas por Día
            </h2>
            {!ventas || ventas.ventas_por_dia.length === 0 ? (
                <ChartEmptyState label="Sin ventas en el período seleccionado" />
            ) : (
                <div className="overflow-x-auto pb-2">
                    <div className="flex items-end gap-2 min-w-max" style={{ height: 180 }}>
                        {ventas.ventas_por_dia.map((d) => {
                            // Bars keep a 2% minimum so days with tiny totals stay visible.
                            const pct = Math.max((d.total / maxVentaDia) * 100, 2)
                            return (
                                <div key={d.fecha} className="flex flex-col items-center gap-1 group" style={{ minWidth: 48 }}>
                                    <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-medium">
                                        {formatWholeMoney(d.total)}
                                    </span>
                                    <div className="w-10 bg-brand/20 rounded-t-lg overflow-hidden flex items-end" style={{ height: 140 }}>
                                        <div
                                            className="w-full bg-gradient-to-t from-brand to-brand/60 rounded-t-lg transition-all duration-500"
                                            style={{ height: `${pct}%` }}
                                        />
                                    </div>
                                    <span className="text-xs text-muted-foreground">{formatDayMonth(d.fecha)}</span>
                                    <span className="text-xs font-bold text-foreground">{d.cantidad_ventas}</span>
                                </div>
                            )
                        })}
                    </div>
                    <p className="text-xs text-muted-foreground mt-3 text-center">El número bajo cada barra indica cantidad de ventas</p>
                </div>
            )}
        </div>
    )
}
