'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, PackageCheck } from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'
import { FormError } from '@/components/ui/form-error'
import { Skeleton } from '@/components/ui/skeleton'
import { getErrorMessage } from '@/lib/errors'
import { fetchLowStock } from '../api'
import type { LowStockItem } from '../types'

/** Variants at or below their minimum stock. Available to every role. */
export function LowStockPage() {
    const [items, setItems] = useState<LowStockItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false
        async function load() {
            try {
                const data = await fetchLowStock()
                if (!cancelled) setItems(data.items)
            } catch (err: unknown) {
                if (!cancelled) setError(getErrorMessage(err, 'Error al cargar el stock bajo'))
            } finally {
                if (!cancelled) setLoading(false)
            }
        }
        load()
        return () => { cancelled = true }
    }, [])

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                    <AlertTriangle className="text-brand" />
                    Stock bajo
                </h1>
                <p className="text-muted-foreground mt-1">Variantes que llegaron a su stock mínimo</p>
            </div>

            <FormError message={error} />

            {loading ? (
                <Skeleton className="h-64 w-full rounded-2xl" />
            ) : items.length === 0 && !error ? (
                <EmptyState icon={PackageCheck} message="Todo el stock está por encima del mínimo" />
            ) : (
                items.length > 0 && (
                    <div className="bg-card rounded-2xl border border-border overflow-x-auto">
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
                                    <tr key={item.variante_id} className="hover:bg-muted/50">
                                        <td className="p-4 font-medium text-foreground">{item.producto_nombre}</td>
                                        <td className="p-4 text-muted-foreground font-mono">{item.sku ?? '-'}</td>
                                        <td className="p-4 text-muted-foreground">{item.talle ?? '-'}</td>
                                        <td className="p-4 text-muted-foreground">{item.color ?? '-'}</td>
                                        <td className={`p-4 text-right font-bold ${item.stock_actual <= 0 ? 'text-destructive' : 'text-amber-600 dark:text-amber-400'}`}>
                                            {item.stock_actual}
                                        </td>
                                        <td className="p-4 text-right text-muted-foreground">{item.stock_minimo}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            )}
        </div>
    )
}
