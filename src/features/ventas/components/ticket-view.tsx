import { formatDateTime } from '@/lib/dates'
import type { BusinessSettings } from '@/features/configuracion'
import { formatMoney } from '@/lib/money'
import type { SaleDetail } from '../types'
import { TICKET_WIDTH, centerText, divider, formatPaymentSummary, itemLines, twoColumns, wrapText } from '../ticket-format'

type TicketViewProps = {
    sale: SaleDetail
    settings: BusinessSettings | null
}

/** Builds the monospace lines of the non-fiscal ticket. */
function buildTicketLines(sale: SaleDetail, settings: BusinessSettings | null): string[] {
    const w = TICKET_WIDTH
    const lines: string[] = []

    if (settings) {
        lines.push(...wrapText(settings.nombre_negocio, w).map(l => centerText(l, w)))
        if (settings.cuit) lines.push(centerText(`CUIT: ${settings.cuit}`, w))
        if (settings.direccion) lines.push(...wrapText(settings.direccion, w).map(l => centerText(l, w)))
        if (settings.telefono) lines.push(centerText(`Tel: ${settings.telefono}`, w))
    }
    lines.push(divider('=', w))
    lines.push(`Fecha: ${formatDateTime(sale.created_at)}`)
    lines.push(`Venta: ${sale.id.slice(0, 8).toUpperCase()}`)
    if (sale.cliente) lines.push(...wrapText(`Cliente: ${sale.cliente.nombre}`, w))
    if (sale.usuario) lines.push(`Atendió: ${sale.usuario.nombre}`)
    if (sale.estado === 'anulada') lines.push(centerText('*** VENTA ANULADA ***', w))
    lines.push(divider('-', w))

    for (const item of sale.items) {
        lines.push(
            ...itemLines(
                {
                    nombre: item.producto_nombre,
                    detalle: [item.talle, item.color].filter(Boolean).join(' '),
                    cantidad: item.cantidad,
                    precio: formatMoney(item.precio_unitario),
                    subtotal: formatMoney(item.subtotal),
                },
                w,
            ),
        )
    }

    lines.push(divider('-', w))
    lines.push(twoColumns('Subtotal', formatMoney(sale.subtotal), w))
    if (sale.descuento_aplicado > 0) lines.push(twoColumns('Descuento', `-${formatMoney(sale.descuento_aplicado)}`, w))
    if (sale.recargo_aplicado > 0) lines.push(twoColumns('Recargo', `+${formatMoney(sale.recargo_aplicado)}`, w))
    lines.push(twoColumns('TOTAL', formatMoney(sale.total), w))
    lines.push(twoColumns('Pago', sale.metodo_pago, w))
    const paymentSummary = formatPaymentSummary(sale.pago)
    if (paymentSummary) lines.push(...wrapText(paymentSummary, w))
    lines.push(divider('=', w))

    if (settings?.pie_ticket) lines.push(...wrapText(settings.pie_ticket, w).map(l => centerText(l, w)))
    lines.push(centerText('Comprobante no válido como factura', w))
    return lines
}

/** Printable 80mm ticket: black on white, monospace, whitespace preserved. */
export function TicketView({ sale, settings }: TicketViewProps) {
    return (
        <pre className="ticket-paper" data-testid="ticket">
            {buildTicketLines(sale, settings).join('\n')}
        </pre>
    )
}
