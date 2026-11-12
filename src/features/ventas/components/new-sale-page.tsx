'use client'

import { useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { useNewSale } from '../hooks/use-new-sale'
import { CartTable } from './cart-table'
import { CheckoutPanel } from './checkout-panel'
import { ClientSelectorModal } from './client-selector-modal'
import { SkuScanner } from './sku-scanner'

/** POS screen: scanner + cart on the left, checkout on the right. */
export function NewSalePage() {
    const sale = useNewSale()
    const [showClientModal, setShowClientModal] = useState(false)

    if (sale.loadingData) {
        return <NewSaleSkeleton />
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-100px)]">
            <div className="lg:col-span-2 flex flex-col gap-4 h-full">
                <SkuScanner
                    value={sale.skuInput}
                    inputRef={sale.skuInputRef}
                    onChange={sale.setSkuInput}
                    onSubmit={sale.scan}
                />
                <CartTable
                    cart={sale.cart}
                    totalItems={sale.totalItems}
                    onQuantityChange={sale.updateQuantity}
                    onRemove={sale.removeFromCart}
                    onClear={sale.clearCart}
                />
            </div>

            <div className="col-span-1 flex flex-col gap-4">
                <CheckoutPanel
                    client={sale.clients.find(c => c.id === sale.selectedClient)}
                    hasClient={sale.selectedClient !== ''}
                    paymentMethod={sale.paymentMethod}
                    totals={sale.totals}
                    adjustments={sale.adjustments}
                    processing={sale.processing}
                    canCheckout={sale.canCheckout}
                    error={sale.error}
                    successMsg={sale.successMsg}
                    onClearClient={() => sale.setSelectedClient('')}
                    onPickClient={() => setShowClientModal(true)}
                    onPaymentMethodChange={sale.setPaymentMethod}
                    onCheckout={sale.checkout}
                />
            </div>

            {showClientModal && (
                <ClientSelectorModal
                    clients={sale.clients}
                    onClose={() => setShowClientModal(false)}
                    onSelect={(clientId) => {
                        sale.setSelectedClient(clientId)
                        setShowClientModal(false)
                    }}
                />
            )}
        </div>
    )
}

function NewSaleSkeleton() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-100px)]">
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
