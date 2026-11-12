'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/errors'
import { createUser, fetchRoles, fetchUsers, updateUserActive, updateUserRole } from '../api'
import type { RoleResponse, UsuarioCreate, UsuarioResponse } from '../types'

/**
 * Loads users and roles and exposes the two admin mutations. Mutations are
 * not optimistic: local state is only replaced with the backend response.
 */
export function useUsers() {
    const [users, setUsers] = useState<UsuarioResponse[]>([])
    const [roles, setRoles] = useState<RoleResponse[]>([])
    const [loading, setLoading] = useState(true)
    const [pendingId, setPendingId] = useState<string | null>(null)

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

    function replaceUser(updated: UsuarioResponse) {
        setUsers(prev => prev.map(u => (u.id === updated.id ? { ...u, ...updated } : u)))
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
        setUsers(prev => [created, ...prev])
        return created
    }

    return { users, roles, loading, pendingId, changeRole, changeActive, addUser }
}
