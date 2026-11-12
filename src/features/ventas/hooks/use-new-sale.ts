'use client'

import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { useCurrentUser } from '@/features/auth'
import { fetchClients, type Client } from '@/features/clientes'
import { fetchProducts } from '@/features/productos'
import { getErrorMessage } from '@/lib/errors'
import { formatMoney } from '@/lib/money'
import { processSale } from '../api'
import { addVariantToCart, cartItemCount, cartTotal, changeQuantity, findVariant, flattenVariants, type CartResult } from '../cart'
import { computeSaleTotals, exceedsEmployeeDiscountLimit, parseAdjustment } from '../pricing'
import type { AdjustmentType, CartItem, PaymentMethod, SaleCreate, SaleResponse, SearchableVariant } from '../types'

/** State and actions of the POS screen: catalog lookup, cart and checkout. */
export function useNewSale() {
    const { isAdmin } = useCurrentUser()

    // Data
    const [searchableVariants, setSearchableVariants] = useState<SearchableVariant[]>([])
    const [clients, setClients] = useState<Client[]>([])

    // UI
    const [loadingData, setLoadingData] = useState(true)
    const [processing, setProcessing] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [successMsg, setSuccessMsg] = useState<string | null>(null)

    // Sale
    const [cart, setCart] = useState<CartItem[]>([])
    const [selectedClient, setSelectedClient] = useState<string>('') // empty string = Consumidor Final
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Efectivo')
    const [skuInput, setSkuInput] = useState('')
    const [discountType, setDiscountType] = useState<AdjustmentType>('porcentaje')
    const [discountInput, setDiscountInput] = useState('')
    const [surchargeType, setSurchargeType] = useState<AdjustmentType>('porcentaje')
    const [surchargeInput, setSurchargeInput] = useState('')

    const skuInputRef = useRef<HTMLInputElement>(null)

    // One idempotency key per checkout attempt: reused when the user retries after an
    // error, so the backend never registers the same sale twice.
    const idempotencyKeyRef = useRef<string | null>(null)

    // Any change to the sale contents invalidates the current attempt's key.
    useEffect(() => {
        idempotencyKeyRef.current = null
    }, [cart, paymentMethod, selectedClient, discountType, discountInput, surchargeType, surchargeInput])

    useEffect(() => {
        async function loadInitialData() {
            try {
                setLoadingData(true)
                const [productsData, clientsData] = await Promise.all([
                    fetchProducts(),
                    fetchClients()
                ])

                setClients(clientsData)
                setSearchableVariants(flattenVariants(productsData))

                setTimeout(() => skuInputRef.current?.focus(), 100)
            } catch (err: unknown) {
                setError(getErrorMessage(err, 'Error cargando datos'))
            } finally {
                setLoadingData(false)
            }
        }
        loadInitialData()
    }, [])

    /** Applies a cart operation, surfacing its rejection (e.g. no stock) as a toast. */
    function applyToCart(operation: (cart: CartItem[]) => CartResult) {
        setCart(prev => {
            const result = operation(prev)
            if (result.error) toast.error(result.error)
            return result.cart
        })
    }

    function scan(e: React.FormEvent) {
        e.preventDefault()
        if (!skuInput.trim()) return

        const term = skuInput.trim().toLowerCase()
        const match = findVariant(searchableVariants, term)

        if (match) {
            applyToCart(prev => addVariantToCart(prev, match))
        } else {
            toast.error(`No se encontró producto con SKU/ID: ${term}`)
        }
        setSkuInput('')
    }

    function updateQuantity(variantId: string, delta: number) {
        applyToCart(prev => changeQuantity(prev, variantId, delta))
    }

    function removeFromCart(variantId: string) {
        setCart(prev => prev.filter(item => item.variantId !== variantId))
    }

    function clearCart() {
        setCart([])
    }

    async function reloadVariants(): Promise<void> {
        setSearchableVariants(flattenVariants(await fetchProducts()))
    }

    const subtotal = cartTotal(cart)
    const discount = parseAdjustment(discountType, discountInput)
    const surcharge = parseAdjustment(surchargeType, surchargeInput)
    const totals = computeSaleTotals(subtotal, discount.adjustment, surcharge.adjustment)
    // The server is authoritative; this only avoids a request that is sure to be rejected.
    const discountOverLimit = !isAdmin && exceedsEmployeeDiscountLimit(subtotal, discount.adjustment)
    const adjustmentsValid = !discount.error && !surcharge.error && !discountOverLimit

    async function checkout() {
        if (cart.length === 0 || processing || !adjustmentsValid) return

        setProcessing(true)
        setError(null)

        if (!idempotencyKeyRef.current) {
            idempotencyKeyRef.current = crypto.randomUUID()
        }
        const idempotencyKey = idempotencyKeyRef.current

        let sale: SaleResponse
        try {
            // Only ids and quantities are sent: the server prices the sale.
            const saleData: SaleCreate = {
                items: cart.map(i => ({
                    variante_id: i.variantId,
                    cantidad: i.quantity
                })),
                metodo_pago: paymentMethod,
                cliente_id: selectedClient || null,
                ...(discount.adjustment && { descuento: discount.adjustment }),
                ...(surcharge.adjustment && { recargo: surcharge.adjustment }),
            }

            sale = await processSale(saleData, idempotencyKey)
        } catch (err: unknown) {
            // Keep the idempotency key so a retry is safe.
            const message = getErrorMessage(err, 'Error al procesar la venta')
            setError(message)
            toast.error(message)
            setProcessing(false)
            return
        }

        // The sale is registered from here on: never report anything below as a sale error.
        idempotencyKeyRef.current = null
        const successText = `Venta registrada por ${formatMoney(sale.total)}`
        toast.success(successText)
        setSuccessMsg(successText)
        setCart([])
        setSkuInput('')
        setSelectedClient('')
        setPaymentMethod('Efectivo')
        setDiscountInput('')
        setSurchargeInput('')

        try {
            await reloadVariants()
        } catch {
            toast.warning('Venta registrada, pero no se pudo actualizar el stock en pantalla')
        }

        setTimeout(() => setSuccessMsg(null), 3000)
        skuInputRef.current?.focus()
        setProcessing(false)
    }

    return {
        clients,
        loadingData,
        processing,
        error,
        successMsg,
        cart,
        totals,
        adjustments: {
            isAdmin,
            discountType,
            discountInput,
            discountError: discount.error ?? null,
            discountOverLimit,
            surchargeType,
            surchargeInput,
            surchargeError: surcharge.error ?? null,
            setDiscountType,
            setDiscountInput,
            setSurchargeType,
            setSurchargeInput,
        },
        canCheckout: cart.length > 0 && adjustmentsValid,
        totalItems: cartItemCount(cart),
        selectedClient,
        setSelectedClient,
        paymentMethod,
        setPaymentMethod,
        skuInput,
        setSkuInput,
        skuInputRef,
        scan,
        updateQuantity,
        removeFromCart,
        clearCart,
        checkout,
    }
}
