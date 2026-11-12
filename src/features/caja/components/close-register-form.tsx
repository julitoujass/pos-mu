'use client'

import { useState } from 'react'
import { DollarSign, Loader2, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { getErrorMessage } from '@/lib/errors'
import { formatMoney, parseMoneyInput } from '@/lib/money'
import { closeRegister } from '../api'
import type { CashSummary } from '../types'

type CloseRegisterFormProps = {
    summary: CashSummary | null
    onSuccess: () => void
}

export function CloseRegisterForm({ summary, onSuccess }: CloseRegisterFormProps) {
    const [finalAmount, setFinalAmount] = useState('')
    const [notes, setNotes] = useState('')
    const [loading, setLoading] = useState(false)
    /** Parsed amount awaiting confirmation; null while the dialog is closed. */
    const [confirmAmount, setConfirmAmount] = useState<number | null>(null)

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        const parsed = parseMoneyInput(finalAmount)
        if (parsed === null) {
            toast.error('Ingresa un monto real válido (0 o mayor).')
            return
        }
        setConfirmAmount(parsed)
    }

    async function executeClose(amount: number) {
        setLoading(true)
        setConfirmAmount(null)
        try {
            await closeRegister({
                monto_real_efectivo: amount,
                observaciones: notes.trim() || undefined
            })
            toast.success('Caja cerrada correctamente')
            onSuccess()
        } catch (err: unknown) {
            toast.error(getErrorMessage(err, 'Error al cerrar caja'))
        } finally {
            setLoading(false)
        }
    }

    const expected = summary ? summary.esperado_efectivo : null

    return (
        <>
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <h3 className="text-xl font-bold text-destructive mb-4 flex items-center gap-2">
                    <Lock size={20} /> Cerrar Caja
                </h3>
                <form
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end"
                >
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Monto Real en Efectivo</label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <input
                                type="text"
                                inputMode="decimal"
                                required
                                value={finalAmount}
                                onChange={(e) => setFinalAmount(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-input bg-background text-foreground font-bold focus:ring-2 focus:ring-destructive focus:border-transparent"
                                placeholder="0,00"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Notas / Observaciones</label>
                        <input
                            type="text"
                            value={notes}
                            maxLength={500}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-destructive focus:border-transparent"
                            placeholder="Todo en orden..."
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading || !finalAmount}
                        className="w-full py-2.5 rounded-xl bg-destructive text-white font-medium hover:bg-destructive/90 transition-colors shadow-lg shadow-destructive/20 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : 'Cerrar Turno'}
                    </button>
                </form>
            </div>

            {confirmAmount !== null && (
                <ConfirmDialog
                    title="¿Cerrar el turno?"
                    confirmLabel="Sí, cerrar"
                    destructive
                    icon={<Lock size={24} className="text-destructive" />}
                    onConfirm={() => executeClose(confirmAmount)}
                    onCancel={() => setConfirmAmount(null)}
                    message={
                        <>
                            <p>
                                Se registrará <span className="font-bold text-foreground">{formatMoney(confirmAmount)}</span> como efectivo real.
                                Esta acción no se puede deshacer.
                            </p>
                            {expected !== null && (
                                <div className="mt-3 space-y-1">
                                    <div>Efectivo esperado: <span className="font-bold text-foreground">{formatMoney(expected)}</span></div>
                                    <div>
                                        Diferencia:{' '}
                                        <span className={`font-bold ${Math.abs(confirmAmount - expected) < 0.005 ? 'text-green-600' : 'text-destructive'}`}>
                                            {formatMoney(confirmAmount - expected)}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </>
                    }
                />
            )}
        </>
    )
}
