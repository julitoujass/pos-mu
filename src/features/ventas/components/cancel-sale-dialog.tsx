'use client'

import { useId, useState } from 'react'
import { Ban } from 'lucide-react'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { FormError } from '@/components/ui/form-error'
import { getErrorMessage } from '@/lib/errors'
import { cancelSale } from '../api'
import type { SaleDetail } from '../types'

export const MAX_CANCEL_REASON_LENGTH = 200

type CancelSaleDialogProps = {
    saleId: string
    onCancelled: (sale: SaleDetail) => void
    onClose: () => void
}

/** Admin-only confirmation that requires a reason (1..200 chars) before cancelling a sale. */
export function CancelSaleDialog({ saleId, onCancelled, onClose }: CancelSaleDialogProps) {
    const fieldId = useId()
    const [motivo, setMotivo] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleConfirm() {
        const trimmed = motivo.trim()
        if (!trimmed) return setError('Ingresá el motivo de la anulación')

        setLoading(true)
        setError(null)
        try {
            onCancelled(await cancelSale(saleId, trimmed))
        } catch (err: unknown) {
            setError(getErrorMessage(err, 'Error al anular la venta'))
            setLoading(false)
        }
    }

    return (
        <ConfirmDialog
            title="Anular venta"
            icon={<Ban className="text-destructive" size={22} />}
            destructive
            loading={loading}
            confirmLabel="Anular venta"
            cancelLabel="Volver"
            message={
                <div className="space-y-3 text-left">
                    <p className="text-center">
                        Se devolverá el stock y la venta dejará de contar en caja y reportes. Esta acción no se puede deshacer.
                    </p>
                    <div>
                        <label htmlFor={fieldId} className="block text-sm font-medium text-foreground mb-1">
                            Motivo
                        </label>
                        <textarea
                            id={fieldId}
                            value={motivo}
                            onChange={e => setMotivo(e.target.value)}
                            maxLength={MAX_CANCEL_REASON_LENGTH}
                            rows={3}
                            disabled={loading}
                            className="w-full px-3 py-2 rounded-xl border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-brand focus:border-transparent resize-none"
                        />
                        <p className="text-xs text-muted-foreground text-right">
                            {motivo.length}/{MAX_CANCEL_REASON_LENGTH}
                        </p>
                    </div>
                    <FormError message={error} />
                </div>
            }
            onConfirm={handleConfirm}
            onCancel={onClose}
        />
    )
}
