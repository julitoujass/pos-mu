import { ArrowDownRight, ArrowUpRight, Banknote } from 'lucide-react'
import { formatDayMonth, formatWholeMoney } from '../format'
import type { CajaResumenReporte } from '../types'
import { ChartEmptyState } from './report-states'

export function CashReportTable({ cajas }: { cajas: CajaResumenReporte | null }) {
    return (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                <Banknote size={20} className="text-brand" />
                Resumen de Cajas
            </h2>
            {!cajas || cajas.resumen_diario.length === 0 ? (
                <ChartEmptyState label="Sin sesiones de caja en el período" />
            ) : (
                <div className="space-y-0 overflow-hidden rounded-xl border border-border">
                    <div className="grid grid-cols-4 gap-0 bg-muted text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        <div className="p-3">Fecha</div>
                        <div className="p-3 text-right">Ventas</div>
                        <div className="p-3 text-right">Real</div>
                        <div className="p-3 text-right">Dif.</div>
                    </div>
                    {cajas.resumen_diario.map((d) => {
                        const dif = d.diferencia_esperado_vs_real
                        const isNeg = dif < 0
                        return (
                            <div key={d.fecha} className="grid grid-cols-4 gap-0 border-t border-border hover:bg-muted/30 transition-colors text-sm">
                                <div className="p-3 text-foreground font-medium">{formatDayMonth(d.fecha)}</div>
                                <div className="p-3 text-right text-muted-foreground">{formatWholeMoney(d.ingresos + d.monto_inicial_total)}</div>
                                <div className="p-3 text-right text-foreground">{formatWholeMoney(d.monto_real_efectivo_total)}</div>
                                <div className={`p-3 text-right font-bold flex items-center justify-end gap-1 ${isNeg ? 'text-red-500' : 'text-emerald-500'}`}>
                                    {isNeg ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
                                    {formatWholeMoney(Math.abs(dif))}
                                </div>
                            </div>
                        )
                    })}
                    <div className="grid grid-cols-4 gap-0 border-t-2 border-border bg-muted/50">
                        <div className="p-3 text-sm font-bold text-foreground col-span-3 text-right">Diferencia Total</div>
                        <div className={`p-3 text-right font-bold text-sm ${cajas.diferencia_total_periodo < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                            {formatWholeMoney(cajas.diferencia_total_periodo)}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
