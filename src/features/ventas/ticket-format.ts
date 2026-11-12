import type { SalePayment } from './types'

/** Characters per line of the 80mm ticket (monospace, ~72mm of printable width). */
export const TICKET_WIDTH = 40

export function divider(char = '-', width = TICKET_WIDTH): string {
    return char.repeat(width)
}

/** `left` flush left and `right` flush right on a line of `width` characters. */
export function twoColumns(left: string, right: string, width = TICKET_WIDTH): string {
    const gap = width - left.length - right.length
    return left + ' '.repeat(Math.max(1, gap)) + right
}

export function centerText(text: string, width = TICKET_WIDTH): string {
    if (text.length >= width) return text
    const total = width - text.length
    const left = Math.floor(total / 2)
    return ' '.repeat(left) + text + ' '.repeat(total - left)
}

/** Word-wraps text to `width`; words longer than the width are split. */
export function wrapText(text: string, width = TICKET_WIDTH): string[] {
    const lines: string[] = []
    let current = ''
    for (const word of text.split(/\s+/).filter(Boolean)) {
        let rest = word
        while (rest.length > width) {
            if (current) {
                lines.push(current)
                current = ''
            }
            lines.push(rest.slice(0, width))
            rest = rest.slice(width)
        }
        if (!current) current = rest
        else if (current.length + 1 + rest.length <= width) current += ` ${rest}`
        else {
            lines.push(current)
            current = rest
        }
    }
    if (current) lines.push(current)
    return lines
}

export type TicketItem = {
    nombre: string
    detalle?: string
    cantidad: number
    /** Already formatted unit price. */
    precio: string
    /** Already formatted line subtotal. */
    subtotal: string
}

/** Name (wrapped) followed by `qty x price .... subtotal`. */
export function itemLines(item: TicketItem, width = TICKET_WIDTH): string[] {
    const title = [item.nombre, item.detalle].filter(Boolean).join(' ')
    return [...wrapText(title, width), twoColumns(`${item.cantidad} x ${item.precio}`, item.subtotal, width)]
}

/** "Tarjeta VISA •••• 4242 · Aut. 123456 · 3 cuotas"; missing parts are skipped. */
export function formatPaymentSummary(pago: SalePayment | null | undefined): string | null {
    if (!pago) return null
    const card = [pago.metodo_pago, pago.tarjeta_marca, pago.tarjeta_ultimos4 && `•••• ${pago.tarjeta_ultimos4}`]
        .filter(Boolean)
        .join(' ')
    const installments = pago.cuotas ? `${pago.cuotas} ${pago.cuotas === 1 ? 'cuota' : 'cuotas'}` : null
    const authorization = pago.codigo_autorizacion ? `Aut. ${pago.codigo_autorizacion}` : null
    return [card, authorization, installments].filter(Boolean).join(' · ') || null
}
