export type CashStatusResponse = {
    id: string;
    estado: string;
    monto_apertura: number;
    fecha_apertura: string;
    fecha_cierre?: string | null;
    monto_real_efectivo?: number | null;
    monto_esperado_efectivo?: number | null;
    observaciones?: string | null;
    usuario_id?: string;
};

export type CashSummary = {
    sesion_id: string;
    estado: string;
    fecha_apertura: string;
    monto_apertura: number;
    ventas_efectivo: number;
    ventas_tarjeta: number;
    ventas_qr: number;
    cantidad_ventas: number;
    ingresos: number;
    egresos: number;
    /** Authoritative expected cash: apertura + cash sales of this session + ingresos - egresos */
    esperado_efectivo: number;
};

export type CashOpen = {
    monto_apertura: number;
};

export type CashClose = {
    monto_real_efectivo: number;
    observaciones?: string;
};

export type CashMovementType = 'ingreso' | 'egreso';

// POST /caja/movimiento returns the raw row (motivo); the list endpoints
// return descripcion. Both are declared on purpose.
export type CashMovement = {
    id: string;
    sesion_id?: string;
    caja_id?: string;
    tipo: CashMovementType;
    monto: number;
    motivo?: string;
    descripcion?: string;
    created_at: string;
    usuario_id?: string;
};

export type CashMovementCreate = {
    tipo: CashMovementType;
    monto: number;
    motivo: string;
};
