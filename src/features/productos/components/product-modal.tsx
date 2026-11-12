'use client'

import { useId, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { FormError } from '@/components/ui/form-error'
import { Modal } from '@/components/ui/modal'
import { getErrorMessage } from '@/lib/errors'
import { createProduct, updateProduct } from '../api'
import type { Product, ProductCreate } from '../types'

type ProductModalProps = {
    mode: 'create' | 'edit'
    initialData?: Product | null
    onClose: () => void
    onSuccess: () => void
}

export function ProductModal({ mode, initialData, onClose, onSuccess }: ProductModalProps) {
    const titleId = useId()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [form, setForm] = useState<ProductCreate>({
        nombre: initialData?.nombre || '',
        descripcion: initialData?.descripcion || ''
    })

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            if (mode === 'edit' && initialData) {
                await updateProduct(initialData.id, form)
            } else {
                await createProduct(form)
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
            className="bg-card rounded-2xl w-full max-w-md p-6 shadow-2xl border border-border"
        >
            <h2 id={titleId} className="text-xl font-bold text-foreground mb-4">
                {mode === 'edit' ? 'Editar Producto' : 'Nuevo Producto'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Nombre *</label>
                    <input
                        type="text"
                        required
                        value={form.nombre}
                        onChange={(e) => { setError(null); setForm({ ...form, nombre: e.target.value }) }}
                        className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                        placeholder="Ej: Camisa Polo"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Descripción</label>
                    <textarea
                        value={form.descripcion || ''}
                        onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-brand focus:border-transparent resize-none transition-all"
                        rows={3}
                        placeholder="Descripción del producto..."
                    />
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
