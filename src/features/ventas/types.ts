export type PaymentMethod = 'Efectivo' | 'Tarjeta' | 'QR';

export const PAYMENT_METHODS: PaymentMethod[] = ['Efectivo', 'Tarjeta', 'QR'];

export type SaleItemCreate = {
    variante_id: string;
    cantidad: number;
};

// Prices and total are NOT sent: the backend takes them from the database.
export type SaleCreate = {
    cliente_id?: string | null;
    metodo_pago: PaymentMethod;
    items: SaleItemCreate[];
};

export type SaleResponse = {
    id: string;
    total: number;
    metodo_pago: string;
    created_at: string;
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
