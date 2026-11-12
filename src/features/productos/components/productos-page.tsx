'use client'

import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { Package, Plus, Search } from 'lucide-react'
import { toast } from 'sonner'
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/ui/error-state'
import { Refreshable } from '@/components/ui/refreshable'
import { Skeleton } from '@/components/ui/skeleton'
import { useCurrentUser } from '@/features/auth'
import { fetchCategorias, type Categoria } from '@/features/catalogos'
import { getErrorMessage } from '@/lib/errors'
import { deleteProduct, deleteVariant } from '../api'
import { useProducts } from '../hooks/use-products'
import type { Product, Variant } from '../types'
import { ProductCard } from './product-card'
import { ProductModal } from './product-modal'
import { StockAdjustModal } from './stock-adjust-modal'
import { StockMovementsModal } from './stock-movements-modal'
import { VariantModal } from './variant-modal'

type ProductModalState = { mode: 'create' } | { mode: 'edit'; product: Product }
type VariantModalState = { productId: string; variant: Variant | null }
type DeleteTarget = { type: 'product'; item: Product } | { type: 'variant'; item: Variant }

export function ProductosPage() {
    const { isAdmin } = useCurrentUser()
    const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined)
    const [categorias, setCategorias] = useState<Categoria[]>([])
    const { products, loading, refreshing, error, reload } = useProducts(categoriaId)
    const [expandedProduct, setExpandedProduct] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const deferredTerm = useDeferredValue(searchTerm)

    const [productModal, setProductModal] = useState<ProductModalState | null>(null)
    const [variantModal, setVariantModal] = useState<VariantModalState | null>(null)
    const [stockAdjustVariant, setStockAdjustVariant] = useState<Variant | null>(null)
    const [movementsVariant, setMovementsVariant] = useState<Variant | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null)
    const [deleting, setDeleting] = useState(false)

    useEffect(() => {
        // The filter is optional: without categories the page still works.
        fetchCategorias().then(setCategorias).catch(() => setCategorias([]))
    }, [])

    async function handleConfirmDelete() {
        if (!deleteTarget) return
        setDeleting(true)
        try {
            if (deleteTarget.type === 'product') {
                await deleteProduct(deleteTarget.item.id)
                toast.success(`Producto "${deleteTarget.item.nombre}" eliminado`)
            } else {
                await deleteVariant(deleteTarget.item.id)
                toast.success('Variante eliminada')
            }
            setDeleteTarget(null)
            reload()
        } catch (err: unknown) {
            toast.error(getErrorMessage(err, 'Error al eliminar'))
        } finally {
            setDeleting(false)
        }
    }

    // Client-side search by product name or variant SKU. The filter runs on a deferred
    // copy of the term so typing stays responsive with a large catalog.
    const filteredProducts = useMemo(() => {
        const lowerTerm = deferredTerm.toLowerCase()
        return products.filter(product =>
            product.nombre.toLowerCase().includes(lowerTerm) ||
            product.variantes.some(v => v.sku?.toLowerCase().includes(lowerTerm))
        )
    }, [products, deferredTerm])

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Productos</h1>
                    <p className="text-muted-foreground">Gestiona tu catálogo de productos</p>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => setProductModal({ mode: 'create' })}
                        className="flex items-center gap-2 px-4 py-2.5 bg-brand text-white rounded-xl font-medium hover:bg-brand-hover transition-colors shadow-lg shadow-brand/20 self-start sm:self-auto"
                    >
                        <Plus size={20} />
                        Nuevo Producto
                    </button>
                )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por nombre o SKU..."
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-input bg-card text-foreground focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                />
            </div>
            {categorias.length > 0 && (
                <select
                    aria-label="Filtrar por categoría"
                    value={categoriaId ?? ''}
                    onChange={e => setCategoriaId(e.target.value ? Number(e.target.value) : undefined)}
                    className="px-4 py-3 rounded-xl border border-input bg-card text-foreground focus:ring-2 focus:ring-brand focus:border-transparent"
                >
                    <option value="">Todas las categorías</option>
                    {categorias.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                    ))}
                </select>
            )}
            </div>

            {error && <ErrorState message={error} onRetry={reload} />}

            {loading ? (
                <ProductListSkeleton />
            ) : filteredProducts.length === 0 ? (
                !error && <EmptyState icon={Package} message="No se encontraron productos">
                    {searchTerm ? (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="mt-4 text-brand font-medium hover:underline"
                        >
                            Limpiar búsqueda
                        </button>
                    ) : isAdmin && (
                        <button
                            onClick={() => setProductModal({ mode: 'create' })}
                            className="mt-4 text-brand font-medium hover:underline"
                        >
                            Crear primer producto
                        </button>
                    )}
                </EmptyState>
            ) : (
                <Refreshable refreshing={refreshing}>
                <div className="space-y-4">
                    {filteredProducts.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            expanded={expandedProduct === product.id}
                            isAdmin={isAdmin}
                            onToggle={() => setExpandedProduct(expandedProduct === product.id ? null : product.id)}
                            onEdit={() => setProductModal({ mode: 'edit', product })}
                            onDelete={() => setDeleteTarget({ type: 'product', item: product })}
                            onCreateVariant={() => setVariantModal({ productId: product.id, variant: null })}
                            onEditVariant={(variant) => setVariantModal({ productId: product.id, variant })}
                            onAdjustStock={setStockAdjustVariant}
                            onViewMovements={setMovementsVariant}
                            onDeleteVariant={(variant) => setDeleteTarget({ type: 'variant', item: variant })}
                        />
                    ))}
                </div>
                </Refreshable>
            )}

            {productModal && (
                <ProductModal
                    mode={productModal.mode}
                    initialData={productModal.mode === 'edit' ? productModal.product : null}
                    onClose={() => setProductModal(null)}
                    onSuccess={() => { setProductModal(null); reload(); }}
                />
            )}

            {variantModal && (
                <VariantModal
                    mode={variantModal.variant ? 'edit' : 'create'}
                    initialData={variantModal.variant}
                    productId={variantModal.productId}
                    onClose={() => setVariantModal(null)}
                    onSuccess={() => { setVariantModal(null); reload(); }}
                />
            )}

            {stockAdjustVariant && (
                <StockAdjustModal
                    variant={stockAdjustVariant}
                    onClose={() => setStockAdjustVariant(null)}
                    onSuccess={() => { setStockAdjustVariant(null); reload(); }}
                />
            )}

            {movementsVariant && (
                <StockMovementsModal
                    variant={movementsVariant}
                    onClose={() => setMovementsVariant(null)}
                />
            )}

            {deleteTarget && (
                <DeleteConfirmDialog
                    label={deleteTarget.type === 'product'
                        ? `el producto "${deleteTarget.item.nombre}"`
                        : `la variante "${deleteTarget.item.sku || 'sin SKU'}"`
                    }
                    loading={deleting}
                    onConfirm={handleConfirmDelete}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}
        </div>
    )
}

function ProductListSkeleton() {
    return (
        // One card per product, like ProductCard, so nothing jumps when the list arrives.
        <div className="space-y-4" aria-hidden="true">
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="bg-card rounded-2xl border border-border p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Skeleton className="w-12 h-12 rounded-xl" />
                        <div className="space-y-2">
                            <Skeleton className="h-5 w-48" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    </div>
                    <Skeleton className="h-8 w-8 rounded-full" />
                </div>
            ))}
        </div>
    )
}
