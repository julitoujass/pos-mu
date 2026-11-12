import { describe, expect, it } from 'vitest'
import { toCsv } from '@/lib/csv'
import { CAJAS_CSV_COLUMNS, TOP_PRODUCTS_CSV_COLUMNS, VENTAS_DIA_CSV_COLUMNS } from './export'

function body(csv: string): string[] {
    return csv.replace('﻿', '').split('\r\n')
}

describe('reportes CSV columns', () => {
    it('exports sales per day with net, gross and returns', () => {
        const csv = toCsv(
            [{ fecha: '2026-01-02', total: 900.5, bruto: 1000, devoluciones: 99.5, cantidad_ventas: 3 }],
            VENTAS_DIA_CSV_COLUMNS,
        )
        expect(body(csv)).toEqual([
            'Fecha;Ventas;Bruto;Devoluciones;Neto',
            '2026-01-02;3;1000;99,5;900,5',
        ])
    })

    it('exports top products with size and color', () => {
        const csv = toCsv(
            [{ variante_id: 'v1', nombre_producto: 'Camisa', talle: 'M', color: null, cantidad_vendida: 4, ingresos_generados: 400 }],
            TOP_PRODUCTS_CSV_COLUMNS,
        )
        expect(body(csv)).toEqual(['Producto;Talle;Color;Unidades;Ingresos', 'Camisa;M;;4;400'])
    })

    it('exports cash sessions per day', () => {
        const csv = toCsv(
            [{
                fecha: '2026-01-02',
                sesiones_abiertas: 1,
                monto_inicial_total: 100,
                ingresos: 50,
                egresos: 20,
                monto_real_efectivo_total: 130,
                diferencia_esperado_vs_real: -0.5,
            }],
            CAJAS_CSV_COLUMNS,
        )
        expect(body(csv)).toEqual([
            'Fecha;Sesiones;Monto inicial;Ingresos;Egresos;Efectivo real;Diferencia',
            '2026-01-02;1;100;50;20;130;-0,5',
        ])
    })
})
