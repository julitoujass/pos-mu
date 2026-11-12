import { describe, expect, it } from 'vitest'
import {
    addVariantToCart,
    cartItemCount,
    cartTotal,
    changeQuantity,
    findVariant,
    flattenVariants,
} from './cart'
import type { SearchableVariant } from './types'

const shirt: SearchableVariant = {
    variantId: 'v1',
    productId: 'p1',
    name: 'Camisa',
    sku: 'CAM-001',
    talle: 'M',
    color: '',
    price: 10.1,
    stock: 2,
}

describe('flattenVariants', () => {
    it('flattens products into one entry per variant', () => {
        const flat = flattenVariants([
            {
                id: 'p1',
                nombre: 'Camisa',
                variantes: [
                    { id: 'v1', sku: 'CAM-001', talle: null, color: 'Azul', precio_venta: 100, stock_actual: 3, producto_id: 'p1' },
                    { id: 'v2', precio_venta: 120, stock_actual: 0, producto_id: 'p1' },
                ],
            },
        ])
        expect(flat).toEqual([
            { variantId: 'v1', productId: 'p1', name: 'Camisa', sku: 'CAM-001', talle: '', color: 'Azul', price: 100, stock: 3 },
            { variantId: 'v2', productId: 'p1', name: 'Camisa', sku: '', talle: '', color: '', price: 120, stock: 0 },
        ])
    })
})

describe('findVariant', () => {
    it('matches the SKU case-insensitively or the variant id', () => {
        expect(findVariant([shirt], 'cam-001')).toBe(shirt)
        expect(findVariant([shirt], 'v1')).toBe(shirt)
        expect(findVariant([shirt], 'cam')).toBeUndefined()
    })
})

describe('addVariantToCart', () => {
    it('adds a new line with placeholders for missing attributes', () => {
        const { cart, error } = addVariantToCart([], shirt)
        expect(error).toBeUndefined()
        expect(cart).toEqual([
            { variantId: 'v1', productId: 'p1', name: 'Camisa', sku: 'CAM-001', talle: 'M', color: '-', price: 10.1, quantity: 1, stockMax: 2 },
        ])
    })

    it('increments an existing line up to the available stock', () => {
        const once = addVariantToCart([], shirt).cart
        const twice = addVariantToCart(once, shirt)
        expect(twice.cart[0].quantity).toBe(2)

        const third = addVariantToCart(twice.cart, shirt)
        expect(third.cart).toBe(twice.cart)
        expect(third.error).toBe('Stock insuficiente. Solo hay 2 unidades.')
    })

    it('rejects a variant without stock', () => {
        const result = addVariantToCart([], { ...shirt, stock: 0 })
        expect(result.cart).toEqual([])
        expect(result.error).toBe('Producto sin stock disponible.')
    })
})

describe('changeQuantity', () => {
    const cart = addVariantToCart([], shirt).cart

    it('removes the line when the quantity reaches zero', () => {
        expect(changeQuantity(cart, 'v1', -1)).toEqual({ cart: [] })
    })

    it('keeps the line and reports an error above the stock', () => {
        const full = changeQuantity(cart, 'v1', 1).cart
        const result = changeQuantity(full, 'v1', 1)
        expect(result.cart[0].quantity).toBe(2)
        expect(result.error).toBe('Stock insuficiente. Máximo: 2')
    })
})

describe('totals', () => {
    it('rounds each line and the total to cents', () => {
        const cart = changeQuantity(addVariantToCart([], shirt).cart, 'v1', 1).cart
        expect(cartTotal(cart)).toBe(20.2)
        expect(cartItemCount(cart)).toBe(2)
        expect(cartTotal([])).toBe(0)
    })
})
