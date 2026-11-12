export type RoleResponse = {
    id: number;
    nombre: string;
};

export type UsuarioResponse = {
    id: string;
    nombre: string;
    /** Present in the create response. */
    email?: string | null;
    apellido?: string | null;
    activo: boolean;
    roles?: RoleResponse | null;
    created_at: string;
};

export type UsuarioCreate = {
    email: string;
    /** Temporary password, 8..72 characters. */
    password: string;
    nombre: string;
    apellido?: string;
    rol_id: number;
};
