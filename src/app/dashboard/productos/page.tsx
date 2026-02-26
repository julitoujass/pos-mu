'use client'

import { useState, useEffect } from 'react'
import { Package, Plus, ChevronDown, ChevronUp, AlertCircle, Loader2, Edit, Pencil, Search } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import {
    fetchProducts,
    createProduct,
    updateProduct,
    createVariant,
    updateVariant,
    Product,
    ProductCreate,
    ProductUpdate,
    VariantCreate,
    VariantUpdate,
    Variant
} from '@/lib/api'

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [expandedProduct, setExpandedProduct] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')

    // Modal states
    const [productModalMode, setProductModalMode] = useState<'create' | 'edit'>('create')
    const [editingProduct, setEditingProduct] = useState<Product | null>(null)
    const [showProductModal, setShowProductModal] = useState(false)

    const [variantModalMode, setVariantModalMode] = useState<'create' | 'edit'>('create')
    const [showVariantModal, setShowVariantModal] = useState(false)
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
    const [editingVariant, setEditingVariant] = useState<Variant | null>(null)

    async function loadProducts() {
        try {
            setLoading(true)
            const data = await fetchProducts()
            setProducts(data)
        } catch (err: any) {
            const msg = err?.message || 'Error desconocido'
            setError(`Error al cargar productos: ${msg}`)
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadProducts()
    }, [])

    function handleCreateProduct() {
        setProductModalMode('create')
        setEditingProduct(null)
        setShowProductModal(true)
    }

    function handleEditProduct(product: Product) {
        setProductModalMode('edit')
        setEditingProduct(product)
        setShowProductModal(true)
    }

    function handleCreateVariant(productId: string) {
        setVariantModalMode('create')
        setSelectedProductId(productId)
        setEditingVariant(null)
        setShowVariantModal(true)
    }

    function handleEditVariant(product_id: string, variant: Variant) {
        setVariantModalMode('edit')
        setSelectedProductId(product_id)
        setEditingVariant(variant)
        setShowVariantModal(true)
    }

    const filteredProducts = products.filter(product => {
        const lowerTerm = searchTerm.toLowerCase()
        const matchName = product.nombre.toLowerCase().includes(lowerTerm)
        const matchSku = product.variantes.some(v => v.sku?.toLowerCase().includes(lowerTerm))
        return matchName || matchSku
    })

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Productos</h1>
                    <p className="text-muted-foreground">Gestiona tu catálogo de productos</p>
                </div>
                <button
                    onClick={handleCreateProduct}
                    className="flex items-center gap-2 px-4 py-2.5 bg-brand text-white rounded-xl font-medium hover:bg-brand-hover transition-colors shadow-lg shadow-brand/20 self-start sm:self-auto"
                >
                    <Plus size={20} />
                    Nuevo Producto
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por nombre o SKU..."
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-input bg-card text-foreground focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                />
            </div>

            {error && (
                <div className="p-4 bg-destructive/10 text-destructive rounded-xl flex items-center gap-3">
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}

            {loading ? (
                <div className="space-y-4">
                    <div className="bg-card rounded-2xl border border-border overflow-hidden">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="p-4 flex items-center justify-between border-b border-border last:border-0">
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
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="text-center py-12 bg-card rounded-2xl border border-border">
                    <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No se encontraron productos</p>
                    {searchTerm ? (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="mt-4 text-brand font-medium hover:underline"
                        >
                            Limpiar búsqueda
                        </button>
                    ) : (
                        <button
                            onClick={handleCreateProduct}
                            className="mt-4 text-brand font-medium hover:underline"
                        >
                            Crear primer producto
                        </button>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredProducts.map((product) => (
                        <div key={product.id} className="bg-card rounded-2xl border border-border overflow-hidden">
                            <div
                                className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => setExpandedProduct(expandedProduct === product.id ? null : product.id)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-brand/10 rounded-xl flex items-center justify-center">
                                        <Package className="w-6 h-6 text-brand" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground flex items-center gap-2">
                                            {product.nombre}
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleEditProduct(product); }}
                                                className="p-1 rounded-full text-muted-foreground hover:text-brand hover:bg-brand/10 transition-colors"
                                                title="Editar Producto"
                                            >
                                                <Pencil size={14} />
                                            </button>
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            {product.variantes.length} variante{product.variantes.length !== 1 ? 's' : ''}
                                            {product.descripcion && ` • ${product.descripcion}`}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleCreateVariant(product.id); }}
                                        className="px-3 py-1.5 text-sm font-medium text-brand bg-brand/10 rounded-lg hover:bg-brand/20 transition-colors"
                                    >
                                        + Variante
                                    </button>
                                    {expandedProduct === product.id ? (
                                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                                    )}
                                </div>
                            </div>

                            {expandedProduct === product.id && (
                                <div className="border-t border-border p-4 bg-muted/30">
                                    {product.variantes.length === 0 ? (
                                        <p className="text-sm text-muted-foreground text-center py-4">Sin variantes</p>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="text-left text-muted-foreground border-b border-border">
                                                        <th className="pb-2 font-medium">Acciones</th>
                                                        <th className="pb-2 font-medium">SKU</th>
                                                        <th className="pb-2 font-medium">Talle</th>
                                                        <th className="pb-2 font-medium">Color</th>
                                                        <th className="pb-2 font-medium text-right">Costo</th>
                                                        <th className="pb-2 font-medium text-right">Venta</th>
                                                        <th className="pb-2 font-medium text-right">Margen</th>
                                                        <th className="pb-2 font-medium text-right">Min.</th>
                                                        <th className="pb-2 font-medium text-right">Stock</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {product.variantes.map((variant) => {
                                                        const costo = variant.precio_costo || 0
                                                        const venta = variant.precio_venta || 0
                                                        const margen = venta > 0 && costo > 0 ? ((venta - costo) / venta * 100).toFixed(1) : '-'
                                                        const stockMin = variant.stock_minimo || 0
                                                        const isLowStock = variant.stock_actual <= stockMin

                                                        return (
                                                            <tr key={variant.id} className="border-b border-border last:border-0 hover:bg-card/50">
                                                                <td className="py-2">
                                                                    <button
                                                                        onClick={() => handleEditVariant(product.id, variant)}
                                                                        className="p-1.5 rounded-lg text-muted-foreground hover:text-brand hover:bg-brand/10 transition-colors"
                                                                    >
                                                                        <Pencil size={16} />
                                                                    </button>
                                                                </td>
                                                                <td className="py-2 text-foreground font-mono text-xs">{variant.sku || '-'}</td>
                                                                <td className="py-2 text-muted-foreground">{variant.talle || '-'}</td>
                                                                <td className="py-2 text-muted-foreground">{variant.color || '-'}</td>
                                                                <td className="py-2 text-right text-muted-foreground">
                                                                    ${costo.toLocaleString('es-AR')}
                                                                </td>
                                                                <td className="py-2 text-right text-foreground font-medium">
                                                                    ${venta.toLocaleString('es-AR')}
                                                                </td>
                                                                <td className="py-2 text-right text-muted-foreground font-mono text-xs">
                                                                    {margen !== '-' ? `${margen}%` : '-'}
                                                                </td>
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
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Product Modal */}
            {showProductModal && (
                <ProductModal
                    mode={productModalMode}
                    initialData={editingProduct}
                    onClose={() => setShowProductModal(false)}
                    onSuccess={() => { setShowProductModal(false); loadProducts(); }}
                />
            )}

            {/* Variant Modal */}
            {showVariantModal && selectedProductId && (
                <VariantModal
                    mode={variantModalMode}
                    initialData={editingVariant}
                    productId={selectedProductId}
                    onClose={() => { setShowVariantModal(false); setSelectedProductId(null); }}
                    onSuccess={() => { setShowVariantModal(false); setSelectedProductId(null); loadProducts(); }}
                />
            )}
        </div>
    )
}

// ============ PRODUCT MODAL ============
interface ProductModalProps {
    mode: 'create' | 'edit';
    initialData?: Product | null;
    onClose: () => void;
    onSuccess: () => void;
}

function ProductModal({ mode, initialData, onClose, onSuccess }: ProductModalProps) {
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState<ProductCreate>({
        nombre: initialData?.nombre || '',
        descripcion: initialData?.descripcion || ''
    })

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        try {
            if (mode === 'edit' && initialData) {
                await updateProduct(initialData.id, form)
            } else {
                await createProduct(form)
            }
            onSuccess()
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-card rounded-2xl w-full max-w-md p-6 shadow-2xl border border-border">
                <h2 className="text-xl font-bold text-foreground mb-4">
                    {mode === 'edit' ? 'Editar Producto' : 'Nuevo Producto'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Nombre *</label>
                        <input
                            type="text"
                            required
                            value={form.nombre}
                            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                            className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                            placeholder="Ej: Camisa Polo"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Descripción</label>
                        <textarea
                            value={form.descripcion || ''}
                            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                            className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-brand focus:border-transparent resize-none transition-all"
                            rows={3}
                            placeholder="Descripción del producto..."
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-input text-muted-foreground font-medium hover:bg-muted hover:text-foreground transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl bg-brand text-white font-medium hover:bg-brand-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (mode === 'edit' ? 'Guardar' : 'Crear')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// ============ VARIANT MODAL ============
interface VariantModalProps {
    mode: 'create' | 'edit';
    initialData?: Variant | null;
    productId: string;
    onClose: () => void;
    onSuccess: () => void;
}

function VariantModal({ mode, initialData, productId, onClose, onSuccess }: VariantModalProps) {
    const [loading, setLoading] = useState(false)

    // NOTE: For 'edit' mode, we usually don't verify stock logic in frontend strongly, just pass values.
    const [form, setForm] = useState<VariantCreate>({
        producto_id: productId,
        sku: initialData?.sku || '',
        talle: initialData?.talle || '',
        color: initialData?.color || '',
        precio_venta: initialData?.precio_venta || 0,
        precio_costo: initialData?.precio_costo || 0,
        stock_actual: initialData?.stock_actual || 0,
        stock_minimo: initialData?.stock_minimo || 0,
    })

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        try {
            if (mode === 'edit' && initialData) {
                // Adapt VariantCreate to VariantUpdate request
                const updateData: VariantUpdate = {
                    sku: form.sku,
                    talle: form.talle,
                    color: form.color,
                    precio_venta: form.precio_venta,
                    precio_costo: form.precio_costo,
                    stock_minimo: form.stock_minimo
                    // Note: stock_actual usually not updated here in APIs, but via Inventory endpoint. 
                    // However, check if backend allows it in 'update_variant'.
                    // Based on schema, VariantUpdate doesn't have stock_actual.
                }
                await updateVariant(initialData.id, updateData)
            } else {
                await createVariant(form)
            }
            onSuccess()
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-card rounded-2xl w-full max-w-md p-6 shadow-2xl border border-border max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold text-foreground mb-4">
                    {mode === 'edit' ? 'Editar Variante' : 'Nueva Variante'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">SKU</label>
                            <input
                                type="text"
                                value={form.sku || ''}
                                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                                className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                                placeholder="ABC-001"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Talle</label>
                            <input
                                type="text"
                                value={form.talle || ''}
                                onChange={(e) => setForm({ ...form, talle: e.target.value })}
                                className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                                placeholder="M, L, XL..."
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Color</label>
                        <input
                            type="text"
                            value={form.color || ''}
                            onChange={(e) => setForm({ ...form, color: e.target.value })}
                            className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                            placeholder="Azul, Rojo..."
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Precio Costo</label>
                            <input
                                type="number"
                                min={0}
                                step={0.01}
                                value={form.precio_costo || ''}
                                onChange={(e) => setForm({ ...form, precio_costo: parseFloat(e.target.value) || 0 })}
                                className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Precio Venta *</label>
                            <input
                                type="number"
                                required
                                min={0}
                                step={0.01}
                                value={form.precio_venta}
                                onChange={(e) => setForm({ ...form, precio_venta: parseFloat(e.target.value) || 0 })}
                                className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            {/* Check if updating stock is possible in edit mode. Usually not via this endpoint. */}
                            <label className="block text-sm font-medium text-foreground mb-1">
                                {mode === 'edit' ? 'Stock (Estático)' : 'Stock Inicial'}
                            </label>
                            <input
                                type="number"
                                min={0}
                                disabled={mode === 'edit'} // Disable stock editing in variant update if api doesn't support it
                                value={form.stock_actual}
                                onChange={(e) => setForm({ ...form, stock_actual: parseInt(e.target.value) || 0 })}
                                className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-brand focus:border-transparent disabled:opacity-60 disabled:bg-muted transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Stock Mínimo</label>
                            <input
                                type="number"
                                min={0}
                                value={form.stock_minimo || ''}
                                onChange={(e) => setForm({ ...form, stock_minimo: parseInt(e.target.value) || 0 })}
                                className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                            />
                        </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-input text-muted-foreground font-medium hover:bg-muted hover:text-foreground transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl bg-brand text-white font-medium hover:bg-brand-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (mode === 'edit' ? 'Guardar' : 'Crear')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
