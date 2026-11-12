'use client'

import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { useCurrentUser } from '@/features/auth'
import { fetchClients, type Client } from '@/features/clientes'
import { useBusinessSettings } from '@/features/configuracion'
import { fetchProducts } from '@/features/productos'
import { useTerminalStatus, usesTerminal } from '@/features/pagos'
import { getErrorMessage } from '@/lib/errors'
import { formatMoney } from '@/lib/money'
import { processSale } from '../api'
import { openTicket } from '../open-ticket'
import { addVariantToCart, cartItemCount, cartTotal, changeQuantity, findVariant, flattenVariants, type CartResult } from '../cart'
import { DEFAULT_EMPLOYEE_MAX_DISCOUNT_PERCENT } from '../pricing'
import type { CartItem, PaymentMethod, SaleCreate, SaleResponse, SearchableVariant } from '../types'
import { useSaleAdjustments } from './use-sale-adjustments'
import { useTerminalCheckout } from './use-terminal-checkout'

/** State and actions of the POS screen: catalog lookup, cart and checkout. */
export function useNewSale() {
    const { isAdmin } = useCurrentUser()
    const { settings } = useBusinessSettings()
    const maxDiscountPercent = settings?.descuento_max_empleado ?? DEFAULT_EMPLOYEE_MAX_DISCOUNT_PERCENT
    const { status: terminalStatus } = useTerminalStatus()
    const terminal = useTerminalCheckout({ onApproved: pago => void completeSale(pago.venta_id, pago.monto) })

    // Data
    const [searchableVariants, setSearchableVariants] = useState<SearchableVariant[]>([])
    const [clients, setClients] = useState<Client[]>([])

    // UI
    const [loadingData, setLoadingData] = useState(true)
    const [loadError, setLoadError] = useState<string | null>(null)
    const [loadAttempt, setLoadAttempt] = useState(0)
    const [processing, setProcessing] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [successMsg, setSuccessMsg] = useState<string | null>(null)

    // Sale
    const [cart, setCart] = useState<CartItem[]>([])
    const [selectedClient, setSelectedClient] = useState<string>('') // empty string = Consumidor Final
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Efectivo')
    const [skuInput, setSkuInput] = useState('')

    const subtotal = cartTotal(cart)
    const {
        discount,
        surcharge,
        totals,
        adjustments,
        adjustmentsValid,
        resetAdjustments,
        inputsKey: adjustmentsKey,
    } = useSaleAdjustments(subtotal, isAdmin, maxDiscountPercent)

    const skuInputRef = useRef<HTMLInputElement>(null)

    // One idempotency key per checkout attempt: reused when the user retries after an
    // error, so the backend never registers the same sale twice.
    const idempotencyKeyRef = useRef<string | null>(null)

    // Any change to the sale contents invalidates the current attempt's key.
    useEffect(() => {
        idempotencyKeyRef.current = null
    }, [cart, paymentMethod, selectedClient, adjustmentsKey])

    useEffect(() => {
        let cancelled = false
        async function loadInitialData() {
            try {
                setLoadingData(true)
                setLoadError(null)
                const [productsData, clientsData] = await Promise.all([
                    fetchProducts(),
                    fetchClients()
                ])
                if (cancelled) return

                setClients(clientsData)
                setSearchableVariants(flattenVariants(productsData))

                setTimeout(() => skuInputRef.current?.focus(), 100)
            } catch (err: unknown) {
                if (!cancelled) setLoadError(getErrorMessage(err, 'Error cargando datos'))
            } finally {
                if (!cancelled) setLoadingData(false)
            }
        }
        loadInitialData()
        return () => { cancelled = true }
    }, [loadAttempt])

    function retryLoad() {
        setLoadAttempt(n => n + 1)
    }

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

    async function checkout() {
        if (cart.length === 0 || processing || !adjustmentsValid) return

        setProcessing(true)
        setError(null)

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

        // Card / QR with the terminal enabled: the sale is registered once the charge is approved.
        if (paymentMethod !== 'Efectivo' && usesTerminal(paymentMethod, terminalStatus)) {
            try {
                await terminal.start({ ...saleData, metodo_pago: paymentMethod })
            } catch (err: unknown) {
                reportCheckoutError(getErrorMessage(err, 'Error al iniciar el cobro'))
            } finally {
                setProcessing(false)
            }
            return
        }

        if (!idempotencyKeyRef.current) {
            idempotencyKeyRef.current = crypto.randomUUID()
        }
        const idempotencyKey = idempotencyKeyRef.current

        let sale: SaleResponse
        try {
            sale = await processSale(saleData, idempotencyKey)
        } catch (err: unknown) {
            // Keep the idempotency key so a retry is safe.
            reportCheckoutError(getErrorMessage(err, 'Error al procesar la venta'))
            setProcessing(false)
            return
        }

        // The sale is registered from here on: never report anything below as a sale error.
        idempotencyKeyRef.current = null
        setProcessing(false)
        await completeSale(sale.id, sale.total)
    }

    function reportCheckoutError(message: string) {
        setError(message)
        toast.error(message)
    }

    /** The sale exists: announce it, reset the counter for the next customer and refresh stock. */
    async function completeSale(saleId: string | null, total: number) {
        const successText = `Venta registrada por ${formatMoney(total)}`
        toast.success(successText, {
            action: saleId ? { label: 'Imprimir ticket', onClick: () => openTicket(saleId) } : undefined,
        })
        setSuccessMsg(successText)
        setCart([])
        setSkuInput('')
        setSelectedClient('')
        setPaymentMethod('Efectivo')
        resetAdjustments()

        // The counter is ready for the next customer right away: the stock shown on
        // screen refreshes in the background (the server validates stock anyway).
        setTimeout(() => setSuccessMsg(null), 3000)
        skuInputRef.current?.focus()

        try {
            await reloadVariants()
        } catch {
            toast.warning('Venta registrada, pero no se pudo actualizar el stock en pantalla')
        }
    }

    function closeTerminalPayment() {
        terminal.close()
        setTimeout(() => skuInputRef.current?.focus(), 0)
    }

    return {
        clients,
        loadingData,
        loadError,
        retryLoad,
        processing,
        error,
        successMsg,
        cart,
        totals,
        adjustments,
        canCheckout: cart.length > 0 && adjustmentsValid,
        terminalStatus,
        terminalPayment: {
            session: terminal.session,
            payment: terminal.payment,
            retry: terminal.retry,
            close: closeTerminalPayment,
        },
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
