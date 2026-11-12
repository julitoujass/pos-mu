export type Product = {
    id: string;
    nombre: string;
    descripcion?: string | null;
    marca_id?: number | null;
    created_at?: string | null;
    variantes: Variant[];
};

export type ProductCreate = {
    nombre: string;
    descripcion?: string | null;
    marca_id?: number | null;
};

export type ProductUpdate = {
    nombre?: string | null;
    descripcion?: string | null;
    marca_id?: number | null;
};

export type Variant = {
    id: string;
    sku?: string | null;
    talle?: string | null;
    color?: string | null;
    precio_venta: number;
    stock_actual: number;
    producto_id: string;
    /** null for empleado: the backend hides costs from non-admins */
    precio_costo?: number | null;
    stock_minimo?: number;
};

export type VariantCreate = {
    producto_id: string;
    sku?: string | null;
    talle?: string | null;
    color?: string | null;
    precio_venta: number;
    stock_actual?: number;
    stock_minimo?: number;
    precio_costo?: number;
};

// No stock_actual: it can only be set on creation (use the stock adjustment endpoint).
export type VariantUpdate = {
    sku?: string | null;
    talle?: string | null;
    color?: string | null;
    precio_venta?: number | null;
    precio_costo?: number | null;
    stock_minimo?: number | null;
};

export type StockAdjust = {
    variante_id: string;
    /** Positive to add stock, negative to subtract */
    cantidad: number;
    motivo: string;
};
