'use client'

import { useId, useState } from 'react'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { FormError } from '@/components/ui/form-error'
import { Modal } from '@/components/ui/modal'
import { getErrorMessage } from '@/lib/errors'
import type { RoleResponse, UsuarioCreate, UsuarioResponse } from '../types'
import { validateNewUser } from '../validation'

type CreateUserModalProps = {
    roles: RoleResponse[]
    onCreate: (data: UsuarioCreate) => Promise<UsuarioResponse>
    onClose: () => void
}

const inputClass =
    'w-full px-3 py-2.5 rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-brand focus:border-transparent transition-all'

/** Admin form: email, temporary password, name and role. Backend errors (409, 400) are shown inline. */
export function CreateUserModal({ roles, onCreate, onClose }: CreateUserModalProps) {
    const titleId = useId()
    const ids = { email: useId(), password: useId(), nombre: useId(), apellido: useId(), rol: useId() }
    const [form, setForm] = useState({ email: '', password: '', nombre: '', apellido: '', rolId: '' })
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    function set(field: keyof typeof form, value: string) {
        setError(null)
        setForm(prev => ({ ...prev, [field]: value }))
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        const rolId = form.rolId ? Number(form.rolId) : null
        const problem = validateNewUser({ ...form, rolId })
        if (problem || rolId === null) return setError(problem)

        setLoading(true)
        setError(null)
        try {
            const apellido = form.apellido.trim()
            await onCreate({
                email: form.email.trim(),
                password: form.password,
                nombre: form.nombre.trim(),
                ...(apellido && { apellido }),
                rol_id: rolId,
            })
            toast.success('Usuario creado')
            onClose()
        } catch (err: unknown) {
            setError(getErrorMessage(err, 'Error al crear el usuario'))
            setLoading(false)
        }
    }

    return (
        <Modal
            onClose={onClose}
            labelledBy={titleId}
            dismissible={!loading}
            className="bg-card rounded-2xl w-full max-w-md p-6 shadow-2xl border border-border"
        >
            <h2 id={titleId} className="text-xl font-bold text-foreground mb-4">Nuevo usuario</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor={ids.email} className="block text-sm font-medium text-foreground mb-1">Email *</label>
                    <input id={ids.email} type="email" autoComplete="off" className={inputClass} value={form.email} onChange={e => set('email', e.target.value)} />
                </div>
                <div>
                    <label htmlFor={ids.password} className="block text-sm font-medium text-foreground mb-1">Contraseña temporal *</label>
                    <div className="relative">
                        <input
                            id={ids.password}
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="new-password"
                            maxLength={72}
                            className={`${inputClass} pr-11`}
                            value={form.password}
                            onChange={e => set('password', e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(v => !v)}
                            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Entre 8 y 72 caracteres. Compartila con la persona de forma segura.</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label htmlFor={ids.nombre} className="block text-sm font-medium text-foreground mb-1">Nombre *</label>
                        <input id={ids.nombre} className={inputClass} value={form.nombre} onChange={e => set('nombre', e.target.value)} />
                    </div>
                    <div>
                        <label htmlFor={ids.apellido} className="block text-sm font-medium text-foreground mb-1">Apellido</label>
                        <input id={ids.apellido} className={inputClass} value={form.apellido} onChange={e => set('apellido', e.target.value)} />
                    </div>
                </div>
                <div>
                    <label htmlFor={ids.rol} className="block text-sm font-medium text-foreground mb-1">Rol *</label>
                    <select id={ids.rol} className={inputClass} value={form.rolId} onChange={e => set('rolId', e.target.value)}>
                        <option value="">Elegí un rol</option>
                        {roles.map(role => (
                            <option key={role.id} value={role.id}>{role.nombre}</option>
                        ))}
                    </select>
                </div>

                <FormError message={error} />

                <div className="flex gap-3 pt-2">
                    <button type="button" onClick={onClose} disabled={loading} className="flex-1 py-2.5 rounded-xl border border-input text-muted-foreground font-medium hover:bg-muted transition-colors">
                        Cancelar
                    </button>
                    <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl bg-brand text-white font-medium hover:bg-brand-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Crear usuario'}
                    </button>
                </div>
            </form>
        </Modal>
    )
}
