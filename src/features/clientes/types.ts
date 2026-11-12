export type Client = {
    id: string;
    nombre: string;
    dni_cuit?: string | null;
    email?: string | null;
    telefono?: string | null;
    direccion?: string | null;
    ciudad?: string | null;
    tipo_iva?: string | null;
    created_at: string;
};

export type ClientCreate = {
    nombre: string;
    dni_cuit?: string | null;
    email?: string | null;
    telefono?: string | null;
    direccion?: string | null;
    ciudad?: string | null;
    tipo_iva?: string | null;
};

export type ClientUpdate = {
    nombre?: string | null;
    dni_cuit?: string | null;
    email?: string | null;
    telefono?: string | null;
    direccion?: string | null;
    ciudad?: string | null;
    tipo_iva?: string | null;
};
