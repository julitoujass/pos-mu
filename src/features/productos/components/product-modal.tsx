'use client'

import { useEffect, useId, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { FormError } from '@/components/ui/form-error'
import { Modal } from '@/components/ui/modal'
import { fetchCategorias, type Categoria } from '@/features/catalogos'
import { getErrorMessage } from '@/lib/errors'
import { createProduct, setProductCategories, updateProduct } from '../api'
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

    const [categorias, setCategorias] = useState<Categoria[]>([])
    const [selectedIds, setSelectedIds] = useState<number[]>(() => initialData?.categorias?.map(c => c.id) ?? [])

    useEffect(() => {
        let cancelled = false
        fetchCategorias()
            .then(data => { if (!cancelled) setCategorias(data) })
            .catch(() => { if (!cancelled) setError('No se pudieron cargar las categorías') })
        return () => { cancelled = true }
    }, [])

    function toggleCategory(id: number) {
        setSelectedIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]))
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            const saved = mode === 'edit' && initialData
                ? await updateProduct(initialData.id, form)
                : await createProduct(form)
            const previousIds = initialData?.categorias?.map(c => c.id) ?? []
            const changed = selectedIds.length !== previousIds.length || selectedIds.some(id => !previousIds.includes(id))
            if (changed) await setProductCategories(saved.id, selectedIds)
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

                {categorias.length > 0 && (
                    <fieldset>
                        <legend className="block text-sm font-medium text-foreground mb-1">Categorías</legend>
                        <div className="max-h-36 overflow-y-auto border border-input rounded-xl p-2 space-y-1">
                            {categorias.map(cat => (
                                <label key={cat.id} className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-muted cursor-pointer text-sm text-foreground">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.includes(cat.id)}
                                        onChange={() => toggleCategory(cat.id)}
                                        className="accent-brand"
                                    />
                                    {cat.nombre}
                                </label>
                            ))}
                        </div>
                    </fieldset>
                )}

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
