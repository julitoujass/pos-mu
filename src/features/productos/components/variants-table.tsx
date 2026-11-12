import { History, Pencil, PlusCircle, Trash2 } from 'lucide-react'
import { formatMoney } from '@/lib/money'
import type { Variant } from '../types'

type VariantsTableProps = {
    variants: Variant[]
    /** Admins also see costs, margins and the write actions. */
    isAdmin: boolean
    onEdit: (variant: Variant) => void
    onAdjustStock: (variant: Variant) => void
    onViewMovements: (variant: Variant) => void
    onDelete: (variant: Variant) => void
}

export function VariantsTable({ variants, isAdmin, onEdit, onAdjustStock, onViewMovements, onDelete }: VariantsTableProps) {
    if (variants.length === 0) {
        return <p className="text-sm text-muted-foreground text-center py-4">Sin variantes</p>
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="text-left text-muted-foreground border-b border-border">
                        {isAdmin && <th className="pb-2 font-medium">Acciones</th>}
                        <th className="pb-2 font-medium">SKU</th>
                        <th className="pb-2 font-medium">Talle</th>
                        <th className="pb-2 font-medium">Color</th>
                        {isAdmin && <th className="pb-2 font-medium text-right">Costo</th>}
                        <th className="pb-2 font-medium text-right">Venta</th>
                        {isAdmin && <th className="pb-2 font-medium text-right">Margen</th>}
                        <th className="pb-2 font-medium text-right">Min.</th>
                        <th className="pb-2 font-medium text-right">Stock</th>
                    </tr>
                </thead>
                <tbody>
                    {variants.map((variant) => {
                        const costo = variant.precio_costo || 0
                        const venta = variant.precio_venta || 0
                        const margen = venta > 0 && costo > 0 ? ((venta - costo) / venta * 100).toFixed(1) : '-'
                        const stockMin = variant.stock_minimo || 0
                        const isLowStock = variant.stock_actual <= stockMin

                        return (
                            <tr key={variant.id} className="border-b border-border last:border-0 hover:bg-card/50">
                                {isAdmin && (
                                    <td className="py-2">
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => onEdit(variant)}
                                                className="p-1.5 rounded-lg text-muted-foreground hover:text-brand hover:bg-brand/10 transition-colors"
                                                title="Editar"
                                            >
                                                <Pencil size={14} />
                                            </button>
                                            <button
                                                onClick={() => onAdjustStock(variant)}
                                                className="p-1.5 rounded-lg text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 transition-colors"
                                                title="Ajustar stock"
                                            >
                                                <PlusCircle size={14} />
                                            </button>
                                            <button
                                                onClick={() => onViewMovements(variant)}
                                                className="p-1.5 rounded-lg text-muted-foreground hover:text-brand hover:bg-brand/10 transition-colors"
                                                title="Movimientos"
                                                aria-label="Movimientos de stock"
                                            >
                                                <History size={14} />
                                            </button>
                                            <button
                                                onClick={() => onDelete(variant)}
                                                className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                                title="Eliminar variante"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                )}
                                <td className="py-2 text-foreground font-mono text-xs">{variant.sku || '-'}</td>
                                <td className="py-2 text-muted-foreground">{variant.talle || '-'}</td>
                                <td className="py-2 text-muted-foreground">{variant.color || '-'}</td>
                                {isAdmin && (
                                    <td className="py-2 text-right text-muted-foreground">
                                        {formatMoney(costo)}
                                    </td>
                                )}
                                <td className="py-2 text-right text-foreground font-medium">
                                    {formatMoney(venta)}
                                </td>
                                {isAdmin && (
                                    <td className="py-2 text-right text-muted-foreground font-mono text-xs">
                                        {margen !== '-' ? `${margen}%` : '-'}
                                    </td>
                                )}
                                <td className="py-2 text-right text-muted-foreground">
                                    {stockMin}
                                </td>
                                <td className="py-2 text-right">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${isLowStock
                                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                        : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                        }`}>
                                        {variant.stock_actual}
                                    </span>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}
