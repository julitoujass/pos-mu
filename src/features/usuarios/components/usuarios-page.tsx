'use client'

import { useState } from 'react'
import { UserCog, UserPlus } from 'lucide-react'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { ErrorState } from '@/components/ui/error-state'
import { PageHeaderSkeleton } from '@/components/ui/page-skeleton'
import { TableSkeleton } from '@/components/ui/table-skeleton'
import { AdminOnly, useCurrentUser } from '@/features/auth'
import { useUsers } from '../hooks/use-users'
import type { UsuarioResponse } from '../types'
import { CreateUserModal } from './create-user-modal'
import { UsersTable } from './users-table'

type PendingConfirmation = {
    title: string
    message?: string
    run: () => void
}

export function UsuariosPage() {
    return (
        <AdminOnly>
            <UsuariosContent />
        </AdminOnly>
    )
}

function fullNameOf(user: UsuarioResponse) {
    return `${user.nombre} ${user.apellido || ''}`.trim()
}

function UsuariosContent() {
    const { user: currentUser } = useCurrentUser()
    const { users, roles, loading, error, reload, pendingId, changeRole, changeActive, addUser } = useUsers()
    const [confirmation, setConfirmation] = useState<PendingConfirmation | null>(null)
    const [creating, setCreating] = useState(false)

    function handleRoleChange(user: UsuarioResponse, targetRoleId: number) {
        const newRole = roles.find(r => r.id === targetRoleId)
        if (!newRole || newRole.id === user.roles?.id) return
        setConfirmation({
            title: `¿Cambiar el rol de ${fullNameOf(user)} a ${newRole.nombre}?`,
            run: () => changeRole(user, targetRoleId),
        })
    }

    function handleActiveToggle(user: UsuarioResponse) {
        const activo = !user.activo
        const fullName = fullNameOf(user)
        setConfirmation(
            activo
                ? { title: `¿Reactivar a ${fullName}?`, run: () => changeActive(user, activo) }
                : {
                    title: `¿Desactivar a ${fullName}?`,
                    message: 'No va a poder usar el sistema.',
                    run: () => changeActive(user, activo),
                },
        )
    }

    function handleConfirm() {
        confirmation?.run()
        setConfirmation(null)
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <PageHeaderSkeleton />
                <TableSkeleton columns={4} rows={4} />
            </div>
        )
    }

    if (error) {
        return <ErrorState message={error} onRetry={reload} />
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
                <button
                    onClick={() => setCreating(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-brand text-white rounded-xl font-medium hover:bg-brand-hover transition-colors shadow-lg shadow-brand/20 self-start sm:self-auto"
                >
                    <UserPlus size={20} />
                    Nuevo usuario
                </button>
            </div>

            <UsersTable
                users={users}
                roles={roles}
                currentUserId={currentUser?.id}
                pendingId={pendingId}
                onRoleChange={handleRoleChange}
                onActiveToggle={handleActiveToggle}
            />

            {creating && (
                <CreateUserModal roles={roles} onCreate={addUser} onClose={() => setCreating(false)} />
            )}

            {confirmation && (
                <ConfirmDialog
                    title={confirmation.title}
                    message={confirmation.message}
                    confirmLabel="Aceptar"
                    onConfirm={handleConfirm}
                    onCancel={() => setConfirmation(null)}
                />
            )}
        </div>
    )
}
