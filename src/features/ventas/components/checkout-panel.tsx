import { AlertCircle, Banknote, CheckCircle2, CreditCard, QrCode, User, UserPlus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Client } from '@/features/clientes'
import type { TerminalStatus } from '@/features/pagos'
import { formatMoney } from '@/lib/money'
import type { SaleTotals } from '../pricing'
import { PAYMENT_METHODS, type PaymentMethod } from '../types'
import { AdjustmentsSection, type AdjustmentsState } from './adjustments-section'

type CheckoutPanelProps = {
    /** Selected client, or undefined for "Consumidor Final". */
    client: Client | undefined
    hasClient: boolean
    paymentMethod: PaymentMethod
    /** Terminal integration status; null while loading or unavailable. */
    terminalStatus?: TerminalStatus | null
    totals: SaleTotals
    adjustments: AdjustmentsState
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
    terminalStatus = null,
    totals,
    adjustments,
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
                        <div className="bg-brand/10 border border-brand/20 p-3 rounded-xl flex justify-between items-center animate-scale-in">
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

                {terminalStatus?.habilitado && (
                    <p
                        className={`mb-3 text-xs font-medium flex items-center gap-1.5 ${terminalStatus.conectado ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}
                    >
                        <span aria-hidden="true" className={`inline-block w-2 h-2 rounded-full ${terminalStatus.conectado ? 'bg-green-500' : 'bg-amber-500'}`} />
                        {terminalStatus.conectado ? 'Clover conectado' : 'Clover desconectado'}
                    </p>
                )}

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
                <AdjustmentsSection state={adjustments} totals={totals} />

                <div className="flex justify-between items-end">
                    <span className="text-muted-foreground font-medium">Total a Pagar</span>
                    <span className="text-4xl font-black text-foreground tracking-tight tabular-nums">
                        {formatMoney(totals.total)}
                    </span>
                </div>

                <Button
                    onClick={onCheckout}
                    loading={processing}
                    loadingLabel="Procesando venta..."
                    disabled={!canCheckout}
                    icon={<CheckCircle2 size={24} />}
                    className="w-full py-4 font-bold text-lg shadow-lg shadow-brand/25 disabled:shadow-none"
                >
                    Confirmar Venta
                </Button>
            </div>

            {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm flex items-start gap-2">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    {error}
                </div>
            )}

            {successMsg && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-xl text-sm flex items-center gap-2 animate-slide-up">
                    <CheckCircle2 size={16} />
                    {successMsg}
                </div>
            )}
        </div>
    )
}
