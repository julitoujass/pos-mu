import { apiJson } from '@/lib/http';
import type { RoleResponse, UsuarioResponse } from './types';

export function fetchUsers(): Promise<UsuarioResponse[]> {
    return apiJson('/usuarios/', 'Failed to fetch users');
}

export function fetchRoles(): Promise<RoleResponse[]> {
    return apiJson('/usuarios/roles', 'Failed to fetch roles');
}

export function updateUserRole(id: string, rol_id: number): Promise<UsuarioResponse> {
    return apiJson(`/usuarios/${id}/rol`, 'Failed to update user role', {
        method: 'PATCH',
        body: { rol_id },
    });
}

export function updateUserActive(id: string, activo: boolean): Promise<UsuarioResponse> {
    return apiJson(`/usuarios/${id}/activo`, 'Failed to update user status', {
        method: 'PATCH',
        body: { activo },
    });
}
