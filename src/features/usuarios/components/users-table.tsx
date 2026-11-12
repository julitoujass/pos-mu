import { formatDate } from '@/lib/dates'
import { ShieldCheck, Users } from 'lucide-react'
import type { RoleResponse, UsuarioResponse } from '../types'

type UsersTableProps = {
    users: UsuarioResponse[]
    roles: RoleResponse[]
    /** Id of the signed-in user: their own row cannot be edited. */
    currentUserId?: string
    /** Id of the user with a mutation in flight. */
    pendingId: string | null
    onRoleChange: (user: UsuarioResponse, roleId: number) => void
    onActiveToggle: (user: UsuarioResponse) => void
}

export function UsersTable({ users, roles, currentUserId, pendingId, onRoleChange, onActiveToggle }: UsersTableProps) {
    return (
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
                        {users.map((user) => {
                            const isSelf = user.id === currentUserId
                            const locked = isSelf || pendingId === user.id
                            return (
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
                                        <div className="flex items-center gap-3">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${user.activo ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                                {user.activo ? 'Activo' : 'Inactivo'}
                                            </span>
                                            <button
                                                type="button"
                                                role="switch"
                                                aria-checked={user.activo}
                                                aria-label={user.activo ? 'Desactivar usuario' : 'Activar usuario'}
                                                title={isSelf ? 'No podés desactivarte a vos mismo' : undefined}
                                                disabled={locked}
                                                onClick={() => onActiveToggle(user)}
                                                className={`relative h-6 w-11 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${user.activo ? 'bg-brand' : 'bg-muted-foreground/40'}`}
                                            >
                                                <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${user.activo ? 'translate-x-5' : ''}`} />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground">
                                        {formatDate(user.created_at)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {user.roles?.nombre === 'admin' && <ShieldCheck size={16} className="text-brand" />}
                                            <select
                                                className="bg-transparent border border-input rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-brand focus:border-transparent min-w-[140px]"
                                                value={user.roles?.id || ''}
                                                disabled={locked}
                                                title={isSelf ? 'No podés cambiar tu propio rol' : undefined}
                                                onChange={(e) => onRoleChange(user, parseInt(e.target.value))}
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
                            )
                        })}
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
    )
}
