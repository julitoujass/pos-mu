import { formatDateTime } from '@/lib/dates'
import { formatMoney } from '@/lib/money'
import { formatPaymentSummary } from '../ticket-format'
import type { SaleDetail } from '../types'

export function Row({ label, value, tone }: { label: string; value: string; tone?: string }) {
    return (
        <div className={`flex justify-between text-sm ${tone ?? 'text-muted-foreground'}`}>
            <span>{label}</span>
            <span className="font-medium">{value}</span>
        </div>
    )
}

export function CancellationInfo({ sale }: { sale: SaleDetail }) {
    return (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm space-y-1">
            <p className="font-bold">Venta anulada</p>
            {sale.motivo_anulacion && <p>Motivo: {sale.motivo_anulacion}</p>}
            <p>
                {sale.anulada_at && `${formatDateTime(sale.anulada_at)}`}
                {sale.anulada_por && ` por ${sale.anulada_por.nombre}`}
            </p>
        </div>
    )
}

export function ItemsTable({ sale, isAdmin }: { sale: SaleDetail; isAdmin: boolean }) {
    return (
        <div className="overflow-x-auto border border-border rounded-xl">
            <table className="w-full text-sm text-left">
                <thead className="bg-muted text-muted-foreground text-xs uppercase tracking-wider">
                    <tr>
                        <th className="p-3">Producto</th>
                        <th className="p-3 text-center">Cant.</th>
                        <th className="p-3 text-right">Precio</th>
                        {isAdmin && <th className="p-3 text-right">Costo</th>}
                        <th className="p-3 text-right">Subtotal</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {sale.items.map(item => (
                        <tr key={item.variante_id}>
                            <td className="p-3">
                                <p className="font-medium text-foreground">{item.producto_nombre}</p>
                                <p className="text-xs text-muted-foreground">
                                    {[item.sku, item.talle, item.color].filter(Boolean).join(' · ') || '-'}
                                </p>
                            </td>
                            <td className="p-3 text-center text-foreground">
                                {item.cantidad}
                                {(item.cantidad_devuelta ?? 0) > 0 && (
                                    <span className="block text-xs text-amber-600 dark:text-amber-400">
                                        {item.cantidad_devuelta} devuelta{item.cantidad_devuelta === 1 ? '' : 's'}
                                    </span>
                                )}
                            </td>
                            <td className="p-3 text-right text-muted-foreground">{formatMoney(item.precio_unitario)}</td>
                            {isAdmin && (
                                <td className="p-3 text-right text-muted-foreground">
                                    {item.costo_unitario != null ? formatMoney(item.costo_unitario) : '-'}
                                </td>
                            )}
                            <td className="p-3 text-right font-medium text-foreground">{formatMoney(item.subtotal)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

/** Card / QR data of a sale charged through the terminal. */
export function PaymentInfo({ sale }: { sale: SaleDetail }) {
    const summary = formatPaymentSummary(sale.pago)
    if (!summary) return null
    return (
        <div className="text-sm">
            <p className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Pago con terminal</p>
            <p className="text-foreground">{summary}</p>
        </div>
    )
}
