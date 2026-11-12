'use client'

import { useState } from 'react'
import { Bookmark } from 'lucide-react'
import { getErrorMessage } from '@/lib/errors'
import { createMarca, updateMarca } from '../api'
import type { Marca } from '../types'
import { CATALOG_INPUT_CLASS, CATALOG_LABEL_CLASS, CatalogFormModal } from './catalog-form-modal'

type MarcaFormModalProps = {
    /** Brand being edited, or null to create a new one. */
    initialData: Marca | null
    onClose: () => void
    onSuccess: (saved: Marca) => void
}

export function MarcaFormModal({ initialData, onClose, onSuccess }: MarcaFormModalProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [form, setForm] = useState<Partial<Marca>>(initialData || { nombre: '', contacto_nombre: '', telefono: '', email: '' })

    const mode = initialData ? 'edit' : 'create'

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.nombre?.trim()) return setError('El nombre es obligatorio')

        setLoading(true)
        setError(null)
        try {
            const saved = initialData
                ? await updateMarca(initialData.id, form)
                : await createMarca(form)
            onSuccess(saved)
        } catch (err: unknown) {
            setError(getErrorMessage(err, 'Ocurrió un error al guardar'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <CatalogFormModal
            title={mode === 'edit' ? 'Editar Marca' : 'Nueva Marca'}
            subtitle="Completa los detalles de la marca."
            icon={<Bookmark className="w-6 h-6 text-brand" />}
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
                    placeholder="Ej: Nike"
                />
            </div>
            <div>
                <label className={CATALOG_LABEL_CLASS}>Contacto / Vendedor</label>
                <input
                    type="text"
                    value={form.contacto_nombre || ''}
                    onChange={(e) => setForm({ ...form, contacto_nombre: e.target.value })}
                    className={CATALOG_INPUT_CLASS}
                />
            </div>
            <div>
                <label className={CATALOG_LABEL_CLASS}>Teléfono</label>
                <input
                    type="text"
                    value={form.telefono || ''}
                    onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                    className={CATALOG_INPUT_CLASS}
                />
            </div>
            <div>
                <label className={CATALOG_LABEL_CLASS}>Email</label>
                <input
                    type="email"
                    value={form.email || ''}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className={CATALOG_INPUT_CLASS}
                />
            </div>
        </CatalogFormModal>
    )
}
