'use client'

import { useId, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { FormError } from '@/components/ui/form-error'
import { Modal } from '@/components/ui/modal'
import { getErrorMessage } from '@/lib/errors'
import { createVariant, updateVariant } from '../api'
import type { Variant, VariantCreate, VariantUpdate } from '../types'

const INPUT_CLASS = 'w-full px-3 py-2.5 rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-brand focus:border-transparent transition-all'
const LABEL_CLASS = 'block text-sm font-medium text-foreground mb-1'

type VariantModalProps = {
    mode: 'create' | 'edit'
    initialData?: Variant | null
    productId: string
    onClose: () => void
    onSuccess: () => void
}

export function VariantModal({ mode, initialData, productId, onClose, onSuccess }: VariantModalProps) {
    const titleId = useId()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [form, setForm] = useState<VariantCreate>({
        producto_id: productId,
        sku: initialData?.sku || '',
        talle: initialData?.talle || '',
        color: initialData?.color || '',
        precio_venta: initialData?.precio_venta || 0,
        precio_costo: initialData?.precio_costo || 0,
        stock_actual: initialData?.stock_actual || 0,
        stock_minimo: initialData?.stock_minimo || 0,
    })

    function updateField<K extends keyof VariantCreate>(key: K, value: VariantCreate[K]) {
        setError(null)
        setForm(prev => ({ ...prev, [key]: value }))
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            if (mode === 'edit' && initialData) {
                // stock_actual is not accepted by the PATCH endpoint.
                const updateData: VariantUpdate = {
                    sku: form.sku,
                    talle: form.talle,
                    color: form.color,
                    precio_venta: form.precio_venta,
                    precio_costo: form.precio_costo,
                    stock_minimo: form.stock_minimo
                }
                await updateVariant(initialData.id, updateData)
            } else {
                await createVariant(form)
            }
            onSuccess()
        } catch (err: unknown) {
            setError(getErrorMessage(err, 'Ocurrió un error inesperado'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal
            onClose={onClose}
            labelledBy={titleId}
            className="bg-card rounded-2xl w-full max-w-md p-6 shadow-2xl border border-border max-h-[90vh] overflow-y-auto"
        >
            <h2 id={titleId} className="text-xl font-bold text-foreground mb-4">
                {mode === 'edit' ? 'Editar Variante' : 'Nueva Variante'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={LABEL_CLASS}>SKU</label>
                        <input
                            type="text"
                            value={form.sku || ''}
                            onChange={(e) => updateField('sku', e.target.value)}
                            className={INPUT_CLASS}
                            placeholder="ABC-001"
                        />
                    </div>
                    <div>
                        <label className={LABEL_CLASS}>Talle</label>
                        <input
                            type="text"
                            value={form.talle || ''}
                            onChange={(e) => updateField('talle', e.target.value)}
                            className={INPUT_CLASS}
                            placeholder="M, L, XL..."
                        />
                    </div>
                </div>
                <div>
                    <label className={LABEL_CLASS}>Color</label>
                    <input
                        type="text"
                        value={form.color || ''}
                        onChange={(e) => updateField('color', e.target.value)}
                        className={INPUT_CLASS}
                        placeholder="Azul, Rojo..."
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={LABEL_CLASS}>Precio Costo</label>
                        <input
                            type="number"
                            min={0}
                            step={0.01}
                            value={form.precio_costo || ''}
                            onChange={(e) => updateField('precio_costo', parseFloat(e.target.value) || 0)}
                            className={INPUT_CLASS}
                        />
                    </div>
                    <div>
                        <label className={LABEL_CLASS}>Precio Venta *</label>
                        <input
                            type="number"
                            required
                            min={0}
                            step={0.01}
                            value={form.precio_venta}
                            onChange={(e) => updateField('precio_venta', parseFloat(e.target.value) || 0)}
                            className={INPUT_CLASS}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={LABEL_CLASS}>
                            {mode === 'edit' ? 'Stock (solo lectura)' : 'Stock Inicial'}
                        </label>
                        <input
                            type="number"
                            min={0}
                            disabled={mode === 'edit'}
                            value={form.stock_actual}
                            onChange={(e) => updateField('stock_actual', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-brand focus:border-transparent disabled:opacity-60 disabled:bg-muted transition-all"
                        />
                        {mode === 'edit' && (
                            <p className="text-xs text-muted-foreground mt-1">Usar Ajuste de Stock para cambiar.</p>
                        )}
                    </div>
                    <div>
                        <label className={LABEL_CLASS}>Stock Mínimo</label>
                        <input
                            type="number"
                            min={0}
                            value={form.stock_minimo || ''}
                            onChange={(e) => updateField('stock_minimo', parseInt(e.target.value) || 0)}
                            className={INPUT_CLASS}
                        />
                    </div>
                </div>

                <FormError message={error} className="duration-200" />

                <div className="flex gap-3 pt-2">
                    <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-input text-muted-foreground font-medium hover:bg-muted hover:text-foreground transition-colors">
                        Cancelar
                    </button>
                    <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl bg-brand text-white font-medium hover:bg-brand-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (mode === 'edit' ? 'Guardar' : 'Crear')}
                    </button>
                </div>
            </form>
        </Modal>
    )
}
