'use client'

import { useState, useEffect, useRef } from 'react'
import {
    Barcode,
    ShoppingCart,
    Trash2,
    CreditCard,
    Banknote,
    QrCode,
    Loader2,
    AlertCircle,
    Search,
    User,
    Plus,
    Minus,
    CheckCircle2,
    X,
    UserPlus
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import {
    fetchProducts,
    fetchClients,
    processSale,
    Product,
    Client,
    SaleCreate
} from '@/lib/api'
import { useRouter } from 'next/navigation'

interface CartItem {
    variantId: string
    productId: string
    name: string
    sku: string
    talle: string
    color: string
    price: number
    quantity: number
    stockMax: number
}

// Helper to flatten products into searchable variants
interface SearchableVariant {
    variantId: string
    productId: string
    name: string
    sku: string | null
    talle: string | null
    color: string | null
    price: number
    stock: number
}

export default function NewSalePage() {
    const router = useRouter()

    // Data States
    const [products, setProducts] = useState<Product[]>([])
    const [searchableVariants, setSearchableVariants] = useState<SearchableVariant[]>([])
    const [clients, setClients] = useState<Client[]>([])
    const [showClientModal, setShowClientModal] = useState(false)

    // UI States
    const [loadingData, setLoadingData] = useState(true)
    const [processing, setProcessing] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [successMsg, setSuccessMsg] = useState<string | null>(null)

    // Sale States
    const [cart, setCart] = useState<CartItem[]>([])
    const [selectedClient, setSelectedClient] = useState<string>('') // empty string = Consumidor Final
    const [paymentMethod, setPaymentMethod] = useState<string>('Efectivo')
    const [skuInput, setSkuInput] = useState('')

    const skuInputRef = useRef<HTMLInputElement>(null)

    // Load Data on Mount
    useEffect(() => {
        async function loadInitialData() {
            try {
                setLoadingData(true)
                const [productsData, clientsData] = await Promise.all([
                    fetchProducts(),
                    fetchClients()
                ])

                setProducts(productsData)
                setClients(clientsData)

                // Flatten variants for fast lookup
                const flatVariants: SearchableVariant[] = []
                productsData.forEach(p => {
                    p.variantes.forEach(v => {
                        flatVariants.push({
                            variantId: v.id,
                            productId: p.id,
                            name: p.nombre,
                            sku: v.sku || '',
                            talle: v.talle || '',
                            color: v.color || '',
                            price: v.precio_venta,
                            stock: v.stock_actual
                        })
                    })
                })
                setSearchableVariants(flatVariants)

                // Focus input on load
                setTimeout(() => skuInputRef.current?.focus(), 100)
            } catch (err: any) {
                setError(err.message || 'Error cargando datos')
            } finally {
                setLoadingData(false)
            }
        }
        loadInitialData()
    }, [])

    function handleScan(e: React.FormEvent) {
        e.preventDefault()
        if (!skuInput.trim()) return

        const term = skuInput.trim().toLowerCase()

        // Find exact SKU match or fallback to ID
        const match = searchableVariants.find(v => (v.sku?.toLowerCase() === term) || (v.variantId === term))

        if (match) {
            addToCart(match)
            setSkuInput('')
        } else {
            // Optional: Fuzzy search or show error
            // simple toast substitute
            toast.error(`No se encontró producto con SKU/ID: ${term}`)
            setSkuInput('')
        }
    }

    function addToCart(variant: SearchableVariant) {
        setCart(prev => {
            const existing = prev.find(item => item.variantId === variant.variantId)

            if (existing) {
                // Check stock
                if (existing.quantity + 1 > existing.stockMax) {
                    toast.error(`Stock insuficiente. Solo hay ${existing.stockMax} unidades.`)
                    return prev
                }
                return prev.map(item =>
                    item.variantId === variant.variantId
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
            } else {
                // Check stock for new item
                if (variant.stock <= 0) {
                    toast.error(`Producto sin stock disponible.`)
                    return prev
                }
                return [...prev, {
                    variantId: variant.variantId,
                    productId: variant.productId,
                    name: variant.name,
                    sku: variant.sku || 'S/N',
                    talle: variant.talle || '-',
                    color: variant.color || '-',
                    price: variant.price,
                    quantity: 1,
                    stockMax: variant.stock
                }]
            }
        })
    }

    function updateQuantity(variantId: string, delta: number) {
        setCart(prev => {
            return prev.map(item => {
                if (item.variantId === variantId) {
                    const newQty = item.quantity + delta
                    if (newQty <= 0) return null // Filter out later
                    if (newQty > item.stockMax) {
                        toast.error(`Stock insuficiente. Máximo: ${item.stockMax}`)
                        return item
                    }
                    return { ...item, quantity: newQty }
                }
                return item
            }).filter(Boolean) as CartItem[]
        })
    }

    function removeFromCart(variantId: string) {
        setCart(prev => prev.filter(item => item.variantId !== variantId))
    }

    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)

    async function handleProcessSale() {
        if (cart.length === 0) return

        setProcessing(true)
        setError(null)

        try {
            const saleData: SaleCreate = {
                items: cart.map(i => ({
                    variante_id: i.variantId,
                    cantidad: i.quantity,
                    precio_unitario: i.price
                })),
                metodo_pago: paymentMethod,
                total: totalAmount, // Optional depending on backend
                cliente_id: selectedClient || null
            }

            await processSale(saleData)

            setSuccessMsg('¡Venta registrada correctamente!')
            setCart([])
            setSkuInput('')
            setSelectedClient('')
            setPaymentMethod('Efectivo')

            // Reload product data to update local stock cache
            // In a bigger app, we would just decrement local cache optimistically
            const newProducts = await fetchProducts()
            const flatVariants: SearchableVariant[] = []
            newProducts.forEach(p => {
                p.variantes.forEach(v => {
                    flatVariants.push({
                        variantId: v.id,
                        productId: p.id,
                        name: p.nombre,
                        sku: v.sku || '',
                        talle: v.talle || '',
                        color: v.color || '',
                        price: v.precio_venta,
                        stock: v.stock_actual
                    })
                })
            })
            setSearchableVariants(flatVariants)

            setTimeout(() => setSuccessMsg(null), 3000)
            skuInputRef.current?.focus()

        } catch (err: any) {
            setError(err.message || 'Error al procesar la venta')
        } finally {
            setProcessing(false)
        }
    }

    if (loadingData) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-100px)]">
                {/* Left Column Skeleton */}
                <div className="lg:col-span-2 flex flex-col gap-4 h-full">
                    <div className="bg-card p-4 rounded-2xl border border-border shadow-sm">
                        <div className="flex justify-between items-center">
                            <Skeleton className="h-8 w-48" />
                            <Skeleton className="h-10 w-10" />
                        </div>
                        <Skeleton className="h-12 w-full mt-4" />
                    </div>
                    <div className="flex-1 bg-card rounded-2xl border border-border shadow-sm p-4 space-y-4">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                    </div>
                </div>

                {/* Right Column Skeleton */}
                <div className="col-span-1 flex flex-col gap-4">
                    <div className="bg-card p-6 rounded-2xl border border-border shadow-lg flex flex-col gap-6 h-full">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-24 w-full" />
                        <div className="border-t border-border my-2"></div>
                        <Skeleton className="h-6 w-24" />
                        <div className="grid grid-cols-3 gap-2">
                            <Skeleton className="h-10 rounded-lg" />
                            <Skeleton className="h-10 rounded-lg" />
                            <Skeleton className="h-10 rounded-lg" />
                        </div>
                        <div className="mt-auto space-y-4">
                            <div className="flex justify-between">
                                <Skeleton className="h-6 w-24" />
                                <Skeleton className="h-10 w-32" />
                            </div>
                            <Skeleton className="h-16 w-full rounded-xl" />
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-100px)]">
            {/* Left Column: Cart & Scanner */}
            <div className="lg:col-span-2 flex flex-col gap-4 h-full">

                {/* Header & Scanner */}
                <div className="bg-card p-4 rounded-2xl border border-border shadow-sm">
                    <h1 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                        <ShoppingCart className="text-brand" />
                        Nueva Venta
                    </h1>
                    <form onSubmit={handleScan} className="relative">
                        <Barcode className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-6 h-6" />
                        <input
                            ref={skuInputRef}
                            type="text"
                            value={skuInput}
                            onChange={(e) => setSkuInput(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-brand/20 bg-background text-foreground text-lg focus:ring-4 focus:ring-brand/20 focus:border-brand transition-all shadow-inner placeholder:text-muted-foreground/50"
                            placeholder="Escanear producto (SKU) y presionar Enter..."
                            autoComplete="off"
                        />
                        <button
                            type="submit"
                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-brand text-white p-2 rounded-lg hover:bg-brand-hover transition-colors"
                        >
                            <Plus size={20} />
                        </button>
                    </form>
                </div>

                {/* Cart Table */}
                <div className="flex-1 bg-card rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col">
                    <div className="overflow-auto flex-1 p-0">
                        <table className="w-full text-left">
                            <thead className="bg-muted text-muted-foreground sticky top-0 z-10 font-bold text-sm uppercase tracking-wider">
                                <tr>
                                    <th className="p-4">Producto</th>
                                    <th className="p-4 text-center">Cant.</th>
                                    <th className="p-4 text-right">Precio</th>
                                    <th className="p-4 text-right">Subtotal</th>
                                    <th className="p-4 w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {cart.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-12 text-center text-muted-foreground">
                                            <div className="flex flex-col items-center gap-3">
                                                <ShoppingCart size={48} className="opacity-20" />
                                                <p className="text-lg">El carrito está vacío</p>
                                                <p className="text-sm opacity-60">Escanea un producto para comenzar</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    cart.map((item) => (
                                        <tr key={item.variantId} className="hover:bg-muted/30 transition-colors group">
                                            <td className="p-4">
                                                <div className="font-bold text-foreground">{item.name}</div>
                                                <div className="text-xs text-muted-foreground flex gap-2 font-mono mt-1">
                                                    <span className="bg-muted px-1.5 py-0.5 rounded">SKU: {item.sku}</span>
                                                    {item.talle && <span>T: {item.talle}</span>}
                                                    {item.color && <span>C: {item.color}</span>}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-center gap-3 bg-background border border-input rounded-lg w-fit mx-auto px-2 py-1">
                                                    <button
                                                        onClick={() => updateQuantity(item.variantId, -1)}
                                                        className="text-muted-foreground hover:text-destructive transition-colors"
                                                    >
                                                        <Minus size={16} />
                                                    </button>
                                                    <span className="w-8 text-center font-bold font-mono">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.variantId, 1)}
                                                        className="text-muted-foreground hover:text-brand transition-colors"
                                                    >
                                                        <Plus size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="p-4 text-right text-muted-foreground">
                                                ${item.price.toLocaleString('es-AR')}
                                            </td>
                                            <td className="p-4 text-right font-bold text-foreground">
                                                ${(item.price * item.quantity).toLocaleString('es-AR')}
                                            </td>
                                            <td className="p-4 text-right">
                                                <button
                                                    onClick={() => removeFromCart(item.variantId)}
                                                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Cart Footer Stats */}
                    <div className="p-4 bg-muted/30 border-t border-border flex justify-between items-center text-sm text-muted-foreground">
                        <span>Items: <strong className="text-foreground">{totalItems}</strong></span>
                        <button
                            onClick={() => setCart([])}
                            disabled={cart.length === 0}
                            className="text-destructive hover:underline disabled:opacity-50"
                        >
                            Vaciar Carrito
                        </button>
                    </div>
                </div>
            </div>

            {/* Right Column: Checkout */}
            <div className="col-span-1 flex flex-col gap-4">

                {/* Checkout Card */}
                <div className="bg-card p-6 rounded-2xl border border-border shadow-lg flex flex-col gap-6">
                    <div>
                        <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                            <User size={20} className="text-brand" />
                            Datos del Cliente
                        </h2>
                        <div className="space-y-3">
                            <label className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Cliente</label>

                            {selectedClient ? (
                                <div className="bg-brand/10 border border-brand/20 p-3 rounded-xl flex justify-between items-center animate-in fade-in zoom-in-95 duration-200">
                                    <div className="overflow-hidden">
                                        <p className="font-bold text-foreground text-sm truncate">
                                            {clients.find(c => c.id === selectedClient)?.nombre}
                                        </p>
                                        <p className="text-xs text-muted-foreground font-mono truncate">
                                            {clients.find(c => c.id === selectedClient)?.dni_cuit || 'Sin DNI'}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setSelectedClient('')}
                                        className="p-1.5 hover:bg-brand/20 rounded-lg text-brand transition-colors"
                                        title="Quitar cliente"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <div className="bg-muted/30 p-3 rounded-xl border border-border text-sm text-center text-muted-foreground">
                                    Se facturará a: <span className="font-bold text-foreground">Consumidor Final</span>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => setSelectedClient('')}
                                    className={`py-2 px-3 rounded-lg text-sm font-medium border transition-all ${selectedClient === ''
                                        ? 'bg-foreground text-background border-foreground shadow-sm'
                                        : 'bg-background text-foreground border-input hover:bg-muted'}`}
                                >
                                    Consumidor Final
                                </button>
                                <button
                                    onClick={() => setShowClientModal(true)}
                                    className={`py-2 px-3 rounded-lg text-sm font-medium border border-input bg-background text-foreground hover:bg-muted transition-all flex items-center justify-center gap-2 ${selectedClient !== '' ? 'ring-2 ring-brand ring-offset-1' : ''}`}
                                >
                                    <UserPlus size={16} />
                                    {selectedClient ? 'Cambiar' : 'Otro...'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-border my-2"></div>

                    <div>
                        <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                            <CreditCard size={20} className="text-brand" />
                            Pago
                        </h2>

                        <div className="grid grid-cols-3 gap-2 mb-4">
                            {['Efectivo', 'Tarjeta', 'QR'].map(method => (
                                <button
                                    key={method}
                                    onClick={() => setPaymentMethod(method)}
                                    className={`py-2 px-1 rounded-lg text-sm font-medium transition-all border ${paymentMethod === method
                                        ? 'bg-brand text-white border-brand shadow-md'
                                        : 'bg-background text-muted-foreground border-input hover:bg-muted'
                                        }`}
                                >
                                    {method}
                                </button>
                            ))}
                        </div>

                        {paymentMethod === 'Efectivo' && (
                            <div className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 p-3 rounded-xl text-sm flex items-center gap-2">
                                <Banknote size={16} />
                                Se registrará ingreso en Caja.
                            </div>
                        )}
                        {paymentMethod === 'QR' && (
                            <div className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 p-3 rounded-xl text-sm flex items-center gap-2">
                                <QrCode size={16} />
                                Escanear QR y verificar pago.
                            </div>
                        )}
                    </div>

                    <div className="border-t border-border my-2"></div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <span className="text-muted-foreground font-medium">Total a Pagar</span>
                            <span className="text-4xl font-black text-foreground tracking-tight">
                                ${totalAmount.toLocaleString('es-AR')}
                            </span>
                        </div>

                        <button
                            onClick={handleProcessSale}
                            disabled={processing || cart.length === 0}
                            className="w-full py-4 rounded-xl bg-brand text-white font-bold text-lg hover:bg-brand-hover shadow-lg shadow-brand/25 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-2"
                        >
                            {processing ? (
                                <Loader2 className="animate-spin" />
                            ) : (
                                <>
                                    <CheckCircle2 size={24} />
                                    Confirmar Venta
                                </>
                            )}
                        </button>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm flex items-start gap-2">
                            <AlertCircle size={16} className="mt-0.5 shrink-0" />
                            {error}
                        </div>
                    )}

                    {successMsg && (
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-xl text-sm flex items-center gap-2 animate-in slide-in-from-bottom-2">
                            <CheckCircle2 size={16} />
                            {successMsg}
                        </div>
                    )}

                </div>
            </div>

            {
                showClientModal && (
                    <ClientSelectorModal
                        clients={clients}
                        onClose={() => setShowClientModal(false)}
                        onSelect={(clientId) => {
                            setSelectedClient(clientId)
                            setShowClientModal(false)
                        }}
                    />
                )
            }
        </div >
    )
}

function ClientSelectorModal({
    clients,
    onClose,
    onSelect
}: {
    clients: Client[],
    onClose: () => void,
    onSelect: (id: string) => void
}) {
    const [term, setTerm] = useState('')
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        setTimeout(() => inputRef.current?.focus(), 100)
    }, [])

    const filtered = clients.filter(c => {
        const t = term.toLowerCase()
        return c.nombre.toLowerCase().includes(t) ||
            c.dni_cuit?.includes(t) ||
            c.email?.toLowerCase().includes(t)
    })

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-card rounded-2xl w-full max-w-lg p-6 shadow-2xl border border-border h-[80vh] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                        <UserPlus className="text-brand" />
                        Seleccionar Cliente
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
                        <X size={20} className="text-muted-foreground" />
                    </button>
                </div>

                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={term}
                        onChange={(e) => setTerm(e.target.value)}
                        placeholder="Buscar por nombre, DNI o email..."
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                    />
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                    {filtered.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <p>No se encontraron clientes.</p>
                        </div>
                    ) : (
                        filtered.map(client => (
                            <button
                                key={client.id}
                                onClick={() => onSelect(client.id)}
                                className="w-full text-left p-3 rounded-xl hover:bg-muted transition-colors border border-transparent hover:border-border group"
                            >
                                <div className="font-bold text-foreground group-hover:text-brand transition-colors">
                                    {client.nombre}
                                </div>
                                <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                                    {client.dni_cuit && <span className="bg-muted px-1.5 py-0.5 rounded font-mono">DNI: {client.dni_cuit}</span>}
                                    {client.email && <span>{client.email}</span>}
                                </div>
                            </button>
                        ))
                    )}
                </div>

                <div className="mt-4 pt-4 border-t border-border text-center">
                    <p className="text-xs text-muted-foreground">
                        Mostrando {filtered.length} de {clients.length} clientes
                    </p>
                </div>
            </div>
        </div>
    )
}
