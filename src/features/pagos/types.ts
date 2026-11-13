/** Lifecycle of a terminal (card / QR) payment, as reported by the backend. */
export type PaymentStatus =
    | 'pendiente'
    | 'enviado'
    | 'aprobado'
    | 'venta_registrada'
    | 'rechazado'
    | 'cancelado'
    | 'indeterminado'
    | 'error_registro'
    | 'reembolsado';

export type TerminalMethod = 'Tarjeta' | 'QR';

export type TerminalAdjustment = { tipo: 'porcentaje' | 'monto'; valor: number };

/** Same shape as a sale: the backend prices it and registers the sale on approval. */
export type TerminalPaymentCreate = {
    cliente_id?: string | null;
    metodo_pago: TerminalMethod;
    items: { variante_id: string; cantidad: number }[];
    descuento?: TerminalAdjustment;
    recargo?: TerminalAdjustment;
};

export type TerminalPaymentStart = {
    pago_id: string;
    total: number;
    estado: PaymentStatus;
};

export type TerminalPayment = {
    id: string;
    estado: PaymentStatus;
    metodo_pago: string;
    monto: number;
    venta_id: string | null;
    tarjeta_marca: string | null;
    tarjeta_ultimos4: string | null;
    codigo_autorizacion: string | null;
    cuotas: number | null;
    error: string | null;
    created_at: string;
    updated_at: string;
};

export type PaymentsPage = { items: TerminalPayment[]; total: number };

export type PaymentsFilters = {
    estado?: PaymentStatus;
    limit?: number;
    offset?: number;
};

export type TerminalStatus = {
    proveedor: 'fake' | 'clover';
    habilitado: boolean;
    /** The device answers. */
    conectado: boolean;
    /** The Clover account is linked through OAuth. */
    conectado_oauth?: boolean;
    /** Only present when the backend reports the saved values. */
    device_id?: string | null;
    pos_id?: string | null;
    merchant_id?: string | null;
};

export type TerminalSettingsUpdate = {
    habilitado?: boolean;
    device_id?: string;
    pos_id?: string;
};
