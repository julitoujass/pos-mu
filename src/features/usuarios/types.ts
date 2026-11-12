export type RoleResponse = {
    id: number;
    nombre: string;
};

export type UsuarioResponse = {
    id: string;
    nombre: string;
    apellido?: string | null;
    activo: boolean;
    roles?: RoleResponse | null;
    created_at: string;
};
