'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/errors'
import { useAsyncData } from '@/lib/use-async-data'
import { createUser, fetchRoles, fetchUsers, updateUserActive, updateUserRole } from '../api'
import type { RoleResponse, UsuarioCreate, UsuarioResponse } from '../types'

const NO_USERS: UsuarioResponse[] = []
const NO_ROLES: RoleResponse[] = []

async function loadUsersAndRoles() {
    const [users, roles] = await Promise.all([fetchUsers(), fetchRoles()])
    return { users, roles }
}

/**
 * Loads users and roles and exposes the two admin mutations. Mutations are
 * not optimistic: local state is only replaced with the backend response.
 */
export function useUsers() {
    const { data, loading, error, reload, setData } = useAsyncData(
        'users',
        loadUsersAndRoles,
        'Error al cargar la lista de usuarios',
    )
    const [pendingId, setPendingId] = useState<string | null>(null)

    function replaceUser(updated: UsuarioResponse) {
        setData(prev => ({
            ...prev,
            users: prev.users.map(u => (u.id === updated.id ? { ...u, ...updated } : u)),
        }))
    }

    async function changeRole(user: UsuarioResponse, roleId: number) {
        setPendingId(user.id)
        try {
            const updated = await updateUserRole(user.id, roleId)
            replaceUser(updated)
            toast.success("Rol actualizado correctamente")
        } catch (error: unknown) {
            // State is only updated on success, so the select reverts by itself.
            toast.error(getErrorMessage(error, "Error al actualizar rol"))
        } finally {
            setPendingId(null)
        }
    }

    async function changeActive(user: UsuarioResponse, activo: boolean) {
        setPendingId(user.id)
        try {
            const updated = await updateUserActive(user.id, activo)
            replaceUser(updated)
            toast.success(activo ? "Usuario activado" : "Usuario desactivado")
        } catch (error: unknown) {
            toast.error(getErrorMessage(error, "Error al cambiar el estado del usuario"))
        } finally {
            setPendingId(null)
        }
    }

    /** Throws on failure so the creation form can show the backend detail. */
    async function addUser(data: UsuarioCreate): Promise<UsuarioResponse> {
        const created = await createUser(data)
        setData(prev => ({ ...prev, users: [created, ...prev.users] }))
        return created
    }

    return {
        users: data?.users ?? NO_USERS,
        roles: data?.roles ?? NO_ROLES,
        loading,
        error,
        reload,
        pendingId,
        changeRole,
        changeActive,
        addUser,
    }
}
