import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react'
import { formatMoney } from '@/lib/money'
import type { CartItem } from '../types'

type CartTableProps = {
    cart: CartItem[]
    totalItems: number
    onQuantityChange: (variantId: string, delta: number) => void
    onRemove: (variantId: string) => void
    onClear: () => void
}

export function CartTable({ cart, totalItems, onQuantityChange, onRemove, onClear }: CartTableProps) {
    return (
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
                                                onClick={() => onQuantityChange(item.variantId, -1)}
                                                className="text-muted-foreground hover:text-destructive transition-colors"
                                            >
                                                <Minus size={16} />
                                            </button>
                                            <span className="w-8 text-center font-bold font-mono">{item.quantity}</span>
                                            <button
                                                onClick={() => onQuantityChange(item.variantId, 1)}
                                                className="text-muted-foreground hover:text-brand transition-colors"
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="p-4 text-right text-muted-foreground">
                                        {formatMoney(item.price)}
                                    </td>
                                    <td className="p-4 text-right font-bold text-foreground">
                                        {formatMoney(item.price * item.quantity)}
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => onRemove(item.variantId)}
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
            <div className="p-4 bg-muted/30 border-t border-border flex justify-between items-center text-sm text-muted-foreground">
                <span>Items: <strong className="text-foreground">{totalItems}</strong></span>
                <button
                    onClick={onClear}
                    disabled={cart.length === 0}
                    className="text-destructive hover:underline disabled:opacity-50"
                >
                    Vaciar Carrito
                </button>
            </div>
        </div>
    )
}
