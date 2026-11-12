'use client'

import { useId, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { createClient, updateClient } from '../api'
import type { Client, ClientCreate } from '../types'

const INPUT_CLASS = 'w-full px-3 py-2.5 rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-brand focus:border-transparent transition-all'
const LABEL_CLASS = 'block text-sm font-medium text-foreground mb-1'

const IVA_OPTIONS = ['Consumidor Final', 'Monotributista', 'Responsable Inscripto', 'Exento']

type ClientModalProps = {
    mode: 'create' | 'edit'
    initialData?: Client | null
    onClose: () => void
    onSuccess: () => void
}

export function ClientModal({ mode, initialData, onClose, onSuccess }: ClientModalProps) {
    const titleId = useId()
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState<ClientCreate>({
        nombre: initialData?.nombre || '',
        dni_cuit: initialData?.dni_cuit || '',
        email: initialData?.email || '',
        telefono: initialData?.telefono || '',
        direccion: initialData?.direccion || '',
        ciudad: initialData?.ciudad || '',
        tipo_iva: initialData?.tipo_iva || 'Consumidor Final'
    })

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        try {
            // Empty optional fields are sent as null.
            const dataToSubmit = {
                ...form,
                dni_cuit: form.dni_cuit || null,
                email: form.email || null,
                telefono: form.telefono || null,
                direccion: form.direccion || null,
                ciudad: form.ciudad || null
            }

            if (mode === 'edit' && initialData) {
                await updateClient(initialData.id, dataToSubmit)
            } else {
                await createClient(dataToSubmit)
            }
            onSuccess()
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal
            onClose={onClose}
            labelledBy={titleId}
            className="bg-card rounded-2xl w-full max-w-2xl p-6 shadow-2xl border border-border max-h-[90vh] overflow-y-auto"
        >
            <h2 id={titleId} className="text-xl font-bold text-foreground mb-6">
                {mode === 'edit' ? 'Editar Cliente' : 'Nuevo Cliente'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className={LABEL_CLASS}>Nombre Completo *</label>
                        <input
                            type="text"
                            required
                            value={form.nombre}
                            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                            className={INPUT_CLASS}
                            placeholder="Juan Pérez"
                        />
                    </div>

                    <div>
                        <label className={LABEL_CLASS}>DNI / CUIT</label>
                        <input
                            type="text"
                            value={form.dni_cuit || ''}
                            onChange={(e) => setForm({ ...form, dni_cuit: e.target.value })}
                            className={INPUT_CLASS}
                            placeholder="12345678"
                        />
                    </div>

                    <div>
                        <label className={LABEL_CLASS}>Condición IVA</label>
                        <select
                            value={form.tipo_iva || 'Consumidor Final'}
                            onChange={(e) => setForm({ ...form, tipo_iva: e.target.value })}
                            className={INPUT_CLASS}
                        >
                            {IVA_OPTIONS.map(option => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className={LABEL_CLASS}>Email</label>
                        <input
                            type="email"
                            value={form.email || ''}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className={INPUT_CLASS}
                            placeholder="juan@ejemplo.com"
                        />
                    </div>

                    <div>
                        <label className={LABEL_CLASS}>Teléfono</label>
                        <input
                            type="tel"
                            value={form.telefono || ''}
                            onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                            className={INPUT_CLASS}
                            placeholder="+54 9 11 ..."
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className={LABEL_CLASS}>Dirección</label>
                        <input
                            type="text"
                            value={form.direccion || ''}
                            onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                            className={INPUT_CLASS}
                            placeholder="Calle Falsa 123"
                        />
                    </div>

                    <div>
                        <label className={LABEL_CLASS}>Ciudad</label>
                        <input
                            type="text"
                            value={form.ciudad || ''}
                            onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
                            className={INPUT_CLASS}
                            placeholder="Buenos Aires"
                        />
                    </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-border mt-4">
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
