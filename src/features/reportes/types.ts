export type VentaDia = {
    fecha: string;
    total: number;
    cantidad_ventas: number;
};

export type VentasTotalesReporte = {
    total_ingresos: number;
    cantidad_operaciones: number;
    ventas_por_dia: VentaDia[];
};

export type ProductoTopReporte = {
    variante_id: string;
    nombre_producto: string;
    talle?: string | null;
    color?: string | null;
    cantidad_vendida: number;
    ingresos_generados: number;
};

export type CajaResumenDiario = {
    fecha: string;
    sesiones_abiertas: number;
    monto_inicial_total: number;
    ingresos: number;
    egresos: number;
    monto_real_efectivo_total: number;
    diferencia_esperado_vs_real: number;
};

export type CajaResumenReporte = {
    resumen_diario: CajaResumenDiario[];
    diferencia_total_periodo: number;
};
