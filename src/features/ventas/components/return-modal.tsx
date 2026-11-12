'use client'

import { useId, useState } from 'react'
import { Loader2, Minus, Plus, Undo2 } from 'lucide-react'
import { FormError } from '@/components/ui/form-error'
import { Modal } from '@/components/ui/modal'
import { getErrorMessage } from '@/lib/errors'
import { formatMoney } from '@/lib/money'
import { createReturn } from '../api'
import { buildReturnItems, estimateRefund, refundFactor, remainingQuantity } from '../returns'
import type { SaleDetail } from '../types'

export const MAX_RETURN_REASON_LENGTH = 200

type ReturnModalProps = {
    sale: SaleDetail
    onReturned: (sale: SaleDetail) => void
    onClose: () => void
}

/** Admin-only partial return: quantity per item (up to what is left), reason and estimated refund. */
export function ReturnModal({ sale, onReturned, onClose }: ReturnModalProps) {
    const titleId = useId()
    const reasonId = useId()
    const [quantities, setQuantities] = useState<Record<string, number>>({})
    const [motivo, setMotivo] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const items = buildReturnItems(quantities)
    const selected = sale.items
        .map(i => ({ precio_unitario: i.precio_unitario, cantidad: quantities[i.variante_id] ?? 0 }))
        .filter(i => i.cantidad > 0)
    const refund = estimateRefund(selected, refundFactor(sale))

    function change(varianteId: string, delta: number, max: number) {
        setError(null)
        setQuantities(prev => {
            const next = Math.min(max, Math.max(0, (prev[varianteId] ?? 0) + delta))
            return { ...prev, [varianteId]: next }
        })
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        const trimmed = motivo.trim()
        if (items.length === 0) return setError('Elegí al menos un producto a devolver')
        if (!trimmed) return setError('Ingresá el motivo de la devolución')

        setLoading(true)
        setError(null)
        try {
            onReturned(await createReturn(sale.id, { motivo: trimmed, items }))
        } catch (err: unknown) {
            setError(getErrorMessage(err, 'Error al registrar la devolución'))
            setLoading(false)
        }
    }

    return (
        <Modal
            onClose={onClose}
            labelledBy={titleId}
            dismissible={!loading}
            backdrop="strong"
            className="bg-card rounded-2xl w-full max-w-lg p-6 shadow-2xl border border-border max-h-[90vh] overflow-y-auto"
        >
            <h2 id={titleId} className="text-xl font-bold text-foreground mb-1 flex items-center gap-2">
                <Undo2 size={20} className="text-brand" />
                Registrar devolución
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
                Se devuelve el stock y se reintegra lo pagado, proporcional al descuento o recargo de la venta.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <ul className="divide-y divide-border border border-border rounded-xl">
                    {sale.items.map(item => {
                        const max = remainingQuantity(item)
                        const value = quantities[item.variante_id] ?? 0
                        return (
                            <li key={item.variante_id} className="p-3 flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="font-medium text-foreground truncate">{item.producto_nombre}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {[item.talle, item.color].filter(Boolean).join(' · ') || '-'}
                                        {` · Disponibles: ${max}`}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        type="button"
                                        aria-label={`Quitar una unidad de ${item.producto_nombre}`}
                                        disabled={value <= 0}
                                        onClick={() => change(item.variante_id, -1, max)}
                                        className="p-1.5 rounded-lg border border-input hover:bg-muted disabled:opacity-40"
                                    >
                                        <Minus size={14} />
                                    </button>
                                    <span className="w-6 text-center font-medium text-foreground" aria-live="polite">{value}</span>
                                    <button
                                        type="button"
                                        aria-label={`Agregar una unidad de ${item.producto_nombre}`}
                                        disabled={value >= max}
                                        onClick={() => change(item.variante_id, 1, max)}
                                        className="p-1.5 rounded-lg border border-input hover:bg-muted disabled:opacity-40"
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>
                            </li>
                        )
                    })}
                </ul>

                <div>
                    <label htmlFor={reasonId} className="block text-sm font-medium text-foreground mb-1">Motivo *</label>
                    <textarea
                        id={reasonId}
                        value={motivo}
                        onChange={e => { setError(null); setMotivo(e.target.value) }}
                        maxLength={MAX_RETURN_REASON_LENGTH}
                        rows={2}
                        disabled={loading}
                        className="w-full px-3 py-2 rounded-xl border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-brand focus:border-transparent resize-none"
                    />
                    <p className="text-xs text-muted-foreground text-right">{motivo.length}/{MAX_RETURN_REASON_LENGTH}</p>
                </div>

                <div className="flex justify-between items-center p-3 rounded-xl bg-brand/10 text-foreground">
                    <span className="text-sm font-medium">Reintegro estimado</span>
                    <span className="text-lg font-bold">{formatMoney(refund)}</span>
                </div>

                <FormError message={error} />

                <div className="flex gap-3">
                    <button type="button" onClick={onClose} disabled={loading} className="flex-1 py-2.5 rounded-xl border border-input text-muted-foreground font-medium hover:bg-muted transition-colors">
                        Cancelar
                    </button>
                    <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl bg-brand text-white font-medium hover:bg-brand-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Registrar devolución'}
                    </button>
                </div>
            </form>
        </Modal>
    )
}
