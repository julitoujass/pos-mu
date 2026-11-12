import { AlertCircle, Banknote, CheckCircle2, CreditCard, Loader2, QrCode, User, UserPlus, X } from 'lucide-react'
import type { Client } from '@/features/clientes'
import { formatMoney } from '@/lib/money'
import { PAYMENT_METHODS, type PaymentMethod } from '../types'

type CheckoutPanelProps = {
    /** Selected client, or undefined for "Consumidor Final". */
    client: Client | undefined
    hasClient: boolean
    paymentMethod: PaymentMethod
    totalAmount: number
    processing: boolean
    canCheckout: boolean
    error: string | null
    successMsg: string | null
    onClearClient: () => void
    onPickClient: () => void
    onPaymentMethodChange: (method: PaymentMethod) => void
    onCheckout: () => void
}

export function CheckoutPanel({
    client,
    hasClient,
    paymentMethod,
    totalAmount,
    processing,
    canCheckout,
    error,
    successMsg,
    onClearClient,
    onPickClient,
    onPaymentMethodChange,
    onCheckout,
}: CheckoutPanelProps) {
    return (
        <div className="bg-card p-6 rounded-2xl border border-border shadow-lg flex flex-col gap-6">
            <div>
                <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <User size={20} className="text-brand" />
                    Datos del Cliente
                </h2>
                <div className="space-y-3">
                    <label className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Cliente</label>

                    {hasClient ? (
                        <div className="bg-brand/10 border border-brand/20 p-3 rounded-xl flex justify-between items-center animate-in fade-in zoom-in-95 duration-200">
                            <div className="overflow-hidden">
                                <p className="font-bold text-foreground text-sm truncate">
                                    {client?.nombre}
                                </p>
                                <p className="text-xs text-muted-foreground font-mono truncate">
                                    {client?.dni_cuit || 'Sin DNI'}
                                </p>
                            </div>
                            <button
                                onClick={onClearClient}
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
                            onClick={onClearClient}
                            className={`py-2 px-3 rounded-lg text-sm font-medium border transition-all ${!hasClient
                                ? 'bg-foreground text-background border-foreground shadow-sm'
                                : 'bg-background text-foreground border-input hover:bg-muted'}`}
                        >
                            Consumidor Final
                        </button>
                        <button
                            onClick={onPickClient}
                            className={`py-2 px-3 rounded-lg text-sm font-medium border border-input bg-background text-foreground hover:bg-muted transition-all flex items-center justify-center gap-2 ${hasClient ? 'ring-2 ring-brand ring-offset-1' : ''}`}
                        >
                            <UserPlus size={16} />
                            {hasClient ? 'Cambiar' : 'Otro...'}
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
                    {PAYMENT_METHODS.map(method => (
                        <button
                            key={method}
                            onClick={() => onPaymentMethodChange(method)}
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
                        {formatMoney(totalAmount)}
                    </span>
                </div>

                <button
                    onClick={onCheckout}
                    disabled={processing || !canCheckout}
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
    )
}
