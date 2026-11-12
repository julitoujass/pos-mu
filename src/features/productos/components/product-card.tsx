import { ChevronDown, ChevronUp, Package, Pencil, Trash2 } from 'lucide-react'
import type { Product, Variant } from '../types'
import { VariantsTable } from './variants-table'

type ProductCardProps = {
    product: Product
    expanded: boolean
    isAdmin: boolean
    onToggle: () => void
    onEdit: () => void
    onDelete: () => void
    onCreateVariant: () => void
    onEditVariant: (variant: Variant) => void
    onAdjustStock: (variant: Variant) => void
    onDeleteVariant: (variant: Variant) => void
}

/** Expandable product row: header with actions and, when open, its variants. */
export function ProductCard({
    product,
    expanded,
    isAdmin,
    onToggle,
    onEdit,
    onDelete,
    onCreateVariant,
    onEditVariant,
    onAdjustStock,
    onDeleteVariant,
}: ProductCardProps) {
    return (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={onToggle}
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-brand/10 rounded-xl flex items-center justify-center">
                        <Package className="w-6 h-6 text-brand" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground flex items-center gap-2">
                            {product.nombre}
                            {isAdmin && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onEdit(); }}
                                    className="p-1 rounded-full text-muted-foreground hover:text-brand hover:bg-brand/10 transition-colors"
                                    title="Editar Producto"
                                >
                                    <Pencil size={14} />
                                </button>
                            )}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            {product.variantes.length} variante{product.variantes.length !== 1 ? 's' : ''}
                            {product.descripcion && ` • ${product.descripcion}`}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {isAdmin && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onCreateVariant(); }}
                            className="px-3 py-1.5 text-sm font-medium text-brand bg-brand/10 rounded-lg hover:bg-brand/20 transition-colors"
                        >
                            + Variante
                        </button>
                    )}
                    {isAdmin && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(); }}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            title="Eliminar producto"
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                    {expanded ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                </div>
            </div>

            {expanded && (
                <div className="border-t border-border p-4 bg-muted/30">
                    <VariantsTable
                        variants={product.variantes}
                        isAdmin={isAdmin}
                        onEdit={onEditVariant}
                        onAdjustStock={onAdjustStock}
                        onDelete={onDeleteVariant}
                    />
                </div>
            )}
        </div>
    )
}
