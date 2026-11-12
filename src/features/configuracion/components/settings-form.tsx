'use client'

import { useId, useState } from 'react'
import { Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { FormError } from '@/components/ui/form-error'
import { getErrorMessage } from '@/lib/errors'
import { parseMoneyInput } from '@/lib/money'
import { updateSettings } from '../api'
import type { BusinessSettings } from '../types'

type SettingsFormProps = {
    settings: BusinessSettings
    onSaved: (settings: BusinessSettings) => void
}

const inputClass =
    'w-full px-3 py-2.5 rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-brand focus:border-transparent transition-all'

type FieldProps = { label: string; hint?: string; children: (id: string) => React.ReactNode }

function Field({ label, hint, children }: FieldProps) {
    const id = useId()
    return (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-foreground mb-1">{label}</label>
            {children(id)}
            {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
        </div>
    )
}

type FormState = {
    nombre_negocio: string
    cuit: string
    direccion: string
    telefono: string
    email: string
    pie_ticket: string
    descuento_max_empleado: string
}

function toFormState(settings: BusinessSettings): FormState {
    return {
        nombre_negocio: settings.nombre_negocio,
        cuit: settings.cuit ?? '',
        direccion: settings.direccion ?? '',
        telefono: settings.telefono ?? '',
        email: settings.email ?? '',
        pie_ticket: settings.pie_ticket ?? '',
        descuento_max_empleado: String(settings.descuento_max_empleado).replace('.', ','),
    }
}

/** Business data (ticket header/footer) and the employee discount limit. */
export function SettingsForm({ settings, onSaved }: SettingsFormProps) {
    const [form, setForm] = useState<FormState>(() => toFormState(settings))
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    function set(field: keyof FormState, value: string) {
        setError(null)
        setForm(prev => ({ ...prev, [field]: value }))
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        const nombre = form.nombre_negocio.trim()
        if (!nombre) return setError('Ingresá el nombre del negocio')
        const limit = parseMoneyInput(form.descuento_max_empleado)
        if (limit === null || limit > 100) {
            return setError('El descuento máximo debe ser un porcentaje entre 0 y 100')
        }

        setSaving(true)
        setError(null)
        try {
            const saved = await updateSettings({
                nombre_negocio: nombre,
                cuit: form.cuit.trim(),
                direccion: form.direccion.trim(),
                telefono: form.telefono.trim(),
                email: form.email.trim() || null,
                pie_ticket: form.pie_ticket.trim(),
                descuento_max_empleado: limit,
            })
            onSaved(saved)
            toast.success('Configuración guardada')
        } catch (err: unknown) {
            setError(getErrorMessage(err, 'Error al guardar la configuración'))
        } finally {
            setSaving(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-6 space-y-6 max-w-3xl">
            <section className="space-y-4">
                <h2 className="text-lg font-bold text-foreground">Datos del negocio</h2>
                <p className="text-sm text-muted-foreground">Se muestran en el encabezado del ticket.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Nombre del negocio *">
                        {id => <input id={id} className={inputClass} maxLength={120} value={form.nombre_negocio} onChange={e => set('nombre_negocio', e.target.value)} />}
                    </Field>
                    <Field label="CUIT">
                        {id => <input id={id} className={inputClass} maxLength={20} value={form.cuit} onChange={e => set('cuit', e.target.value)} />}
                    </Field>
                    <Field label="Dirección">
                        {id => <input id={id} className={inputClass} maxLength={200} value={form.direccion} onChange={e => set('direccion', e.target.value)} />}
                    </Field>
                    <Field label="Teléfono">
                        {id => <input id={id} className={inputClass} maxLength={30} value={form.telefono} onChange={e => set('telefono', e.target.value)} />}
                    </Field>
                    <Field label="Email">
                        {id => <input id={id} type="email" className={inputClass} value={form.email} onChange={e => set('email', e.target.value)} />}
                    </Field>
                </div>
                <Field label="Pie del ticket" hint="Mensaje al final del ticket (máx. 300 caracteres).">
                    {id => <textarea id={id} rows={2} maxLength={300} className={`${inputClass} resize-none`} value={form.pie_ticket} onChange={e => set('pie_ticket', e.target.value)} />}
                </Field>
            </section>

            <section className="space-y-4">
                <h2 className="text-lg font-bold text-foreground">Ventas</h2>
                <div className="max-w-xs">
                    <Field label="Descuento máximo para empleados (%)" hint="Los administradores no tienen límite.">
                        {id => <input id={id} inputMode="decimal" className={inputClass} value={form.descuento_max_empleado} onChange={e => set('descuento_max_empleado', e.target.value)} />}
                    </Field>
                </div>
            </section>

            <FormError message={error} />

            <div className="flex items-center justify-between gap-4">
                <p className="text-xs text-muted-foreground">
                    {settings.updated_at && `Última modificación: ${new Date(settings.updated_at).toLocaleString('es-AR')}`}
                    {settings.updated_by && ` por ${settings.updated_by.nombre}`}
                </p>
                <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand text-white font-medium hover:bg-brand-hover transition-colors disabled:opacity-50"
                >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save size={18} />}
                    Guardar
                </button>
            </div>
        </form>
    )
}
