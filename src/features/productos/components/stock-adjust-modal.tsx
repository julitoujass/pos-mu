'use client'

import { useId, useState } from 'react'
import { Loader2, MinusCircle, PlusCircle } from 'lucide-react'
import { toast } from 'sonner'
import { FormError } from '@/components/ui/form-error'
import { Modal } from '@/components/ui/modal'
import { getErrorMessage } from '@/lib/errors'
import { adjustStock } from '../api'
import type { Variant } from '../types'

type StockAdjustModalProps = {
    variant: Variant
    onClose: () => void
    onSuccess: () => void
}

export function StockAdjustModal({ variant, onClose, onSuccess }: StockAdjustModalProps) {
    const titleId = useId()
    const [action, setAction] = useState<'add' | 'subtract'>('add')
    const [amount, setAmount] = useState<number | ''>('')
    const [reason, setReason] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!amount || amount <= 0) return setError('Ingresa una cantidad válida')
        if (!reason.trim()) return setError('Ingresa el motivo del ajuste')

        const diff = action === 'add' ? Number(amount) : -Number(amount)
        if (action === 'subtract' && variant.stock_actual + diff < 0) {
            return setError('El stock no puede ser negativo')
        }

        setLoading(true)
        setError(null)
        try {
            await adjustStock({ variante_id: variant.id, cantidad: diff, motivo: reason })
            onSuccess()
            toast.success(`Stock actualizado exitosamente. Nuevo total: ${variant.stock_actual + diff}`)
        } catch (err: unknown) {
            setError(getErrorMessage(err, 'Error al ajustar stock'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal
            onClose={onClose}
            labelledBy={titleId}
            className="bg-card rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-border"
        >
            <h2 id={titleId} className="text-xl font-bold text-foreground mb-1">Ajustar Stock</h2>
            <p className="text-sm text-muted-foreground mb-6">SKU: {variant.sku || 'N/A'}</p>

            <div className="flex bg-muted p-1 rounded-xl mb-6">
                <button
                    type="button"
                    onClick={() => setAction('add')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${action === 'add' ? 'bg-card text-emerald-500 shadow-sm border border-border' : 'text-muted-foreground hover:text-foreground'}`}
                >
                    <PlusCircle size={16} /> Entra
                </button>
                <button
                    type="button"
                    onClick={() => setAction('subtract')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${action === 'subtract' ? 'bg-card text-destructive shadow-sm border border-border' : 'text-muted-foreground hover:text-foreground'}`}
                >
                    <MinusCircle size={16} /> Sale
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Cantidad</label>
                    <input
                        type="number"
                        min="1"
                        value={amount}
                        onChange={(e) => {
                            setError(null);
                            setAmount(e.target.value ? parseInt(e.target.value) : '')
                        }}
                        className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                        placeholder="Ej: 5"
                    />
                    <p className="text-xs text-muted-foreground mt-1 text-right">
                        Nuevo stock será: <span className="font-bold text-foreground">
                            {variant.stock_actual + (action === 'add' ? Number(amount || 0) : -Number(amount || 0))}
                        </span>
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Motivo</label>
                    <input
                        type="text"
                        value={reason}
                        onChange={(e) => { setError(null); setReason(e.target.value) }}
                        className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                        placeholder="Inventario, merma, devolución..."
                    />
                </div>

                <FormError message={error} />

                <div className="flex gap-3 pt-2">
                    <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-input text-muted-foreground font-medium hover:bg-muted transition-colors">
                        Cancelar
                    </button>
                    <button type="submit" disabled={loading} className={`flex-1 py-2.5 rounded-xl text-white font-medium disabled:opacity-50 flex items-center justify-center gap-2 transition-colors ${action === 'add' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-destructive hover:bg-destructive/90'}`}>
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirmar'}
                    </button>
                </div>
            </form>
        </Modal>
    )
}
