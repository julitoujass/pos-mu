'use client'

import { AlertTriangle, PackageCheck } from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/ui/error-state'
import { TableSkeleton } from '@/components/ui/table-skeleton'
import { useAsyncData } from '@/lib/use-async-data'
import { fetchLowStock } from '../api'

/** Variants at or below their minimum stock. Available to every role. */
export function LowStockPage() {
    const { data, loading, error, reload } = useAsyncData('low-stock', fetchLowStock, 'Error al cargar el stock bajo')
    const items = data?.items ?? []

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                    <AlertTriangle className="text-brand" />
                    Stock bajo
                </h1>
                <p className="text-muted-foreground mt-1">Variantes que llegaron a su stock mínimo</p>
            </div>

            {error && <ErrorState message={error} onRetry={reload} />}

            {loading ? (
                <TableSkeleton columns={6} />
            ) : items.length === 0 ? (
                !error && <EmptyState icon={PackageCheck} message="Todo el stock está por encima del mínimo" />
            ) : (
                <div className="bg-card rounded-2xl border border-border overflow-x-auto animate-fade-in">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted text-muted-foreground font-bold text-xs uppercase tracking-wider">
                            <tr>
                                <th className="p-4">Producto</th>
                                <th className="p-4">SKU</th>
                                <th className="p-4">Talle</th>
                                <th className="p-4">Color</th>
                                <th className="p-4 text-right">Stock</th>
                                <th className="p-4 text-right">Mínimo</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {items.map(item => (
                                <tr key={item.variante_id} className="hover:bg-muted/50 transition-colors">
                                    <td className="p-4 font-medium text-foreground">{item.producto_nombre}</td>
                                    <td className="p-4 text-muted-foreground font-mono">{item.sku ?? '-'}</td>
                                    <td className="p-4 text-muted-foreground">{item.talle ?? '-'}</td>
                                    <td className="p-4 text-muted-foreground">{item.color ?? '-'}</td>
                                    <td className={`p-4 text-right font-bold tabular-nums ${item.stock_actual <= 0 ? 'text-destructive' : 'text-amber-600 dark:text-amber-400'}`}>
                                        {item.stock_actual}
                                    </td>
                                    <td className="p-4 text-right text-muted-foreground tabular-nums">{item.stock_minimo}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
