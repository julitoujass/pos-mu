'use client'

import { getErrorMessage } from '@/lib/errors'
import { useState, useEffect } from 'react'
import { fetchUsers, fetchRoles, updateUserRole, UsuarioResponse, RoleResponse } from '@/lib/api'
import { Users, UserCog, ShieldCheck } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

export default function UsuariosPage() {
    const [users, setUsers] = useState<UsuarioResponse[]>([])
    const [roles, setRoles] = useState<RoleResponse[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadData() {
            try {
                const [uData, rData] = await Promise.all([fetchUsers(), fetchRoles()])
                setUsers(uData)
                setRoles(rData)
            } catch (error) {
                console.error("Error cargando usuarios", error)
                toast.error("Error al cargar la lista de usuarios. Asegúrate de ser administrador.")
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [])

    async function handleRoleChange(userId: string, targetRoleId: number) {
        try {
            toast.loading("Actualizando rol...")
            await updateUserRole(userId, targetRoleId)
            toast.dismiss()
            toast.success("Rol actualizado correctamente")
            // Refresh local state
            setUsers(prev => prev.map(u => {
                if (u.id === userId) {
                    const newRole = roles.find(r => r.id === targetRoleId)
                    return { ...u, roles: newRole || u.roles }
                }
                return u
            }))
        } catch (error: unknown) {
            toast.dismiss()
            toast.error(getErrorMessage(error, "Error al actualizar rol"))
        }
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                        <UserCog size={32} className="text-brand" />
                        Gestión de Usuarios
                    </h1>
                    <p className="text-muted-foreground">Administra los roles y accesos del equipo.</p>
                </div>
            </div>

            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-border bg-muted/30">
                    <h3 className="font-bold text-foreground flex items-center gap-2">
                        <Users size={20} /> Base de Personal
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-muted text-muted-foreground font-medium">
                            <tr>
                                <th className="px-6 py-4">Usuario</th>
                                <th className="px-6 py-4">Estado</th>
                                <th className="px-6 py-4">Miembro Desde</th>
                                <th className="px-6 py-4">Nivel de Acceso (Rol)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-muted/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-foreground">
                                            {user.nombre} {user.apellido || ''}
                                        </div>
                                        <div className="text-xs text-muted-foreground truncate max-w-[200px]" title={user.id}>
                                            ID: {user.id.substring(0, 8)}...
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${user.activo ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                            {user.activo ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {user.roles?.nombre === 'admin' && <ShieldCheck size={16} className="text-brand" />}
                                            <select
                                                className="bg-transparent border border-input rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-brand focus:border-transparent min-w-[140px]"
                                                value={user.roles?.id || ''}
                                                onChange={(e) => handleRoleChange(user.id, parseInt(e.target.value))}
                                            >
                                                {roles.map(r => (
                                                    <option key={r.id} value={r.id} className="bg-background text-foreground">
                                                        {r.nombre.charAt(0).toUpperCase() + r.nombre.slice(1)}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                                        No hay usuarios registrados.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
