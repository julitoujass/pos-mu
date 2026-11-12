export type PaymentMethod = 'Efectivo' | 'Tarjeta' | 'QR';

export const PAYMENT_METHODS: PaymentMethod[] = ['Efectivo', 'Tarjeta', 'QR'];

export type SaleItemCreate = {
    variante_id: string;
    cantidad: number;
};

export type AdjustmentType = 'porcentaje' | 'monto';

/** Discount or surcharge: a percentage (<= 100) or a fixed amount. */
export type SaleAdjustment = {
    tipo: AdjustmentType;
    valor: number;
};

// Prices and total are NOT sent: the backend takes them from the database.
export type SaleCreate = {
    cliente_id?: string | null;
    metodo_pago: PaymentMethod;
    items: SaleItemCreate[];
    descuento?: SaleAdjustment;
    recargo?: SaleAdjustment;
};

export type SaleStatus = 'completada' | 'anulada';

export type SaleResponse = {
    id: string;
    total: number;
    metodo_pago: string;
    created_at: string;
    subtotal?: number;
    descuento_aplicado?: number;
    recargo_aplicado?: number;
    estado?: SaleStatus;
};

export type PersonRef = { id: string; nombre: string };

export type SaleListItem = {
    id: string;
    created_at: string;
    subtotal: number;
    descuento_aplicado: number;
    recargo_aplicado: number;
    total: number;
    metodo_pago: string;
    estado: SaleStatus;
    cliente: PersonRef | null;
    usuario: PersonRef | null;
};

export type SalesPage = { items: SaleListItem[]; total: number };

export type SalesFilters = {
    /** YYYY-MM-DD */
    desde?: string;
    /** YYYY-MM-DD */
    hasta?: string;
    metodo_pago?: PaymentMethod;
    estado?: SaleStatus;
    cliente_id?: string;
    usuario_id?: string;
    limit?: number;
    offset?: number;
};

export type SaleDetailItem = {
    variante_id: string;
    sku?: string | null;
    producto_nombre: string;
    talle?: string | null;
    color?: string | null;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
    /** Admin only */
    costo_unitario?: number | null;
};

export type SaleDetail = SaleListItem & {
    motivo_anulacion?: string | null;
    anulada_at?: string | null;
    anulada_por?: PersonRef | null;
    items: SaleDetailItem[];
    /** Admin only */
    total_costo?: number | null;
};

export type CartItem = {
    variantId: string;
    productId: string;
    name: string;
    sku: string;
    talle: string;
    color: string;
    price: number;
    quantity: number;
    stockMax: number;
};

/** A product variant flattened for fast SKU lookup. */
export type SearchableVariant = {
    variantId: string;
    productId: string;
    name: string;
    sku: string | null;
    talle: string | null;
    color: string | null;
    price: number;
    stock: number;
};
