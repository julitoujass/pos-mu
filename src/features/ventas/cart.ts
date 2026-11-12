import type { Product } from '@/features/productos'
import { roundMoney } from '@/lib/money'
import type { CartItem, SearchableVariant } from './types'

/** Result of a cart operation; `error` is a user-facing message when it was rejected. */
export type CartResult = { cart: CartItem[]; error?: string }

/** Flattens products into one searchable entry per variant. */
export function flattenVariants(products: Product[]): SearchableVariant[] {
    return products.flatMap(p =>
        p.variantes.map(v => ({
            variantId: v.id,
            productId: p.id,
            name: p.nombre,
            sku: v.sku || '',
            talle: v.talle || '',
            color: v.color || '',
            price: v.precio_venta,
            stock: v.stock_actual,
        })),
    )
}

/** Finds a variant by exact SKU (case-insensitive), falling back to its id. `term` must be lowercase. */
export function findVariant(variants: SearchableVariant[], term: string): SearchableVariant | undefined {
    return variants.find(v => (v.sku?.toLowerCase() === term) || (v.variantId === term))
}

/** Adds one unit of `variant`, respecting the available stock. */
export function addVariantToCart(cart: CartItem[], variant: SearchableVariant): CartResult {
    const existing = cart.find(item => item.variantId === variant.variantId)

    if (existing) {
        if (existing.quantity + 1 > existing.stockMax) {
            return { cart, error: `Stock insuficiente. Solo hay ${existing.stockMax} unidades.` }
        }
        return {
            cart: cart.map(item =>
                item.variantId === variant.variantId
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ),
        }
    }

    if (variant.stock <= 0) {
        return { cart, error: 'Producto sin stock disponible.' }
    }
    return {
        cart: [...cart, {
            variantId: variant.variantId,
            productId: variant.productId,
            name: variant.name,
            sku: variant.sku || 'S/N',
            talle: variant.talle || '-',
            color: variant.color || '-',
            price: variant.price,
            quantity: 1,
            stockMax: variant.stock,
        }],
    }
}

/** Changes a line quantity by `delta`; the line is removed when it reaches zero. */
export function changeQuantity(cart: CartItem[], variantId: string, delta: number): CartResult {
    let error: string | undefined
    const next = cart.flatMap(item => {
        if (item.variantId !== variantId) return [item]
        const newQty = item.quantity + delta
        if (newQty <= 0) return []
        if (newQty > item.stockMax) {
            error = `Stock insuficiente. Máximo: ${item.stockMax}`
            return [item]
        }
        return [{ ...item, quantity: newQty }]
    })
    return error ? { cart: next, error } : { cart: next }
}

/** Estimate only: the backend computes the authoritative total from DB prices. */
export function cartTotal(cart: CartItem[]): number {
    return roundMoney(cart.reduce((sum, item) => sum + roundMoney(item.price * item.quantity), 0))
}

export function cartItemCount(cart: CartItem[]): number {
    return cart.reduce((sum, item) => sum + item.quantity, 0)
}
