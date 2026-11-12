export type Marca = {
    id: number;
    nombre: string;
    contacto_nombre?: string | null;
    telefono?: string | null;
    email?: string | null;
    created_at?: string | null;
};

export type Categoria = {
    id: number;
    nombre: string;
    descripcion?: string | null;
    tiendanube_id?: string | null;
    created_at?: string | null;
};

export type CatalogTab = 'marcas' | 'categorias';
