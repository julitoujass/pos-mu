export type VentaDia = {
    fecha: string;
    /** Net of returns. */
    total: number;
    bruto: number;
    devoluciones: number;
    cantidad_ventas: number;
};

export type VentasTotalesReporte = {
    /** Net of returns. */
    total_ingresos: number;
    total_bruto: number;
    total_devoluciones: number;
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
    /** Cash sales of the day's sessions (cancelled sales excluded). */
    ventas_efectivo: number;
    ingresos: number;
    egresos: number;
    monto_real_efectivo_total: number;
    diferencia_esperado_vs_real: number;
};

export type CajaResumenReporte = {
    resumen_diario: CajaResumenDiario[];
    diferencia_total_periodo: number;
};
