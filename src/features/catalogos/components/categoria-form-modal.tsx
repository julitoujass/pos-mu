'use client'

import { useState } from 'react'
import { Tags } from 'lucide-react'
import { getErrorMessage } from '@/lib/errors'
import { createCategoria, updateCategoria } from '../api'
import type { Categoria } from '../types'
import { CATALOG_INPUT_CLASS, CATALOG_LABEL_CLASS, CatalogFormModal } from './catalog-form-modal'

type CategoriaFormModalProps = {
    /** Category being edited, or null to create a new one. */
    initialData: Categoria | null
    onClose: () => void
    onSuccess: (saved: Categoria) => void
}

export function CategoriaFormModal({ initialData, onClose, onSuccess }: CategoriaFormModalProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [form, setForm] = useState<Partial<Categoria>>(initialData || { nombre: '', descripcion: '' })

    const mode = initialData ? 'edit' : 'create'

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.nombre?.trim()) return setError('El nombre es obligatorio')

        setLoading(true)
        setError(null)
        try {
            const saved = initialData
                ? await updateCategoria(initialData.id, form)
                : await createCategoria(form)
            onSuccess(saved)
        } catch (err: unknown) {
            setError(getErrorMessage(err, 'Ocurrió un error al guardar'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <CatalogFormModal
            title={mode === 'edit' ? 'Editar Categoría' : 'Nueva Categoría'}
            subtitle="Clasifica tus productos eficientemente."
            icon={<Tags className="w-6 h-6 text-brand" />}
            mode={mode}
            loading={loading}
            error={error}
            onClose={onClose}
            onSubmit={handleSubmit}
        >
            <div>
                <label className={CATALOG_LABEL_CLASS}>Nombre *</label>
                <input
                    type="text"
                    value={form.nombre || ''}
                    onChange={(e) => { setError(null); setForm({ ...form, nombre: e.target.value }) }}
                    className={CATALOG_INPUT_CLASS}
                    placeholder="Ej: Remeras"
                />
            </div>
            <div>
                <label className={CATALOG_LABEL_CLASS}>Descripción</label>
                <textarea
                    value={form.descripcion || ''}
                    onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                    className={`${CATALOG_INPUT_CLASS} min-h-[100px] resize-none`}
                />
            </div>
        </CatalogFormModal>
    )
}
