import { Package } from 'lucide-react'
import { formatWholeMoney } from '../format'
import type { ProductoTopReporte } from '../types'
import { ChartEmptyState } from './report-states'

export function TopProducts({ productos }: { productos: ProductoTopReporte[] }) {
    const maxIngreso = productos.length > 0 ? Math.max(...productos.map(p => p.ingresos_generados), 1) : 1

    return (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                <Package size={20} className="text-brand" />
                Top Productos
            </h2>
            {productos.length === 0 ? (
                <ChartEmptyState label="Sin datos de productos" />
            ) : (
                <div className="space-y-3">
                    {productos.slice(0, 10).map((p, i) => {
                        const pct = (p.ingresos_generados / maxIngreso) * 100
                        return (
                            <div key={p.variante_id} className="group">
                                <div className="flex items-center justify-between mb-1 gap-2">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className="text-xs font-bold text-muted-foreground w-5 shrink-0">#{i + 1}</span>
                                        <span className="text-sm font-medium text-foreground truncate">{p.nombre_producto}</span>
                                        <div className="flex gap-1 shrink-0">
                                            {p.talle && <span className="px-1.5 py-0.5 bg-muted rounded text-xs text-muted-foreground">{p.talle}</span>}
                                            {p.color && <span className="px-1.5 py-0.5 bg-muted rounded text-xs text-muted-foreground">{p.color}</span>}
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <div className="text-sm font-bold text-foreground">{formatWholeMoney(p.ingresos_generados)}</div>
                                        <div className="text-xs text-muted-foreground">{p.cantidad_vendida} uds.</div>
                                    </div>
                                </div>
                                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-brand to-brand/60 rounded-full transition-all duration-700"
                                        style={{ width: `${pct}%` }}
                                    />
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
