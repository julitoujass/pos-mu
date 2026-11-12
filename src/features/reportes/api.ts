import { apiJson, toQueryString } from '@/lib/http';
import type { CajaResumenReporte, ProductoTopReporte, VentasTotalesReporte } from './types';

function rangeQuery(fechaInicio?: string, fechaFin?: string): string {
    return toQueryString({ fecha_inicio: fechaInicio, fecha_fin: fechaFin });
}

export function fetchReporteVentas(fechaInicio?: string, fechaFin?: string): Promise<VentasTotalesReporte> {
    return apiJson(`/reportes/ventas${rangeQuery(fechaInicio, fechaFin)}`, 'Failed to fetch sales report');
}

export function fetchReporteProductosTop(fechaInicio?: string, fechaFin?: string): Promise<ProductoTopReporte[]> {
    return apiJson(`/reportes/productos-top${rangeQuery(fechaInicio, fechaFin)}`, 'Failed to fetch top products report');
}

export function fetchReporteCajas(fechaInicio?: string, fechaFin?: string): Promise<CajaResumenReporte> {
    return apiJson(`/reportes/cajas${rangeQuery(fechaInicio, fechaFin)}`, 'Failed to fetch cash report');
}
