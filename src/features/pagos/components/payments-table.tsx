import { formatDateTime } from '@/lib/dates'
import { formatMoney } from '@/lib/money'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { canReconcile } from '../review-filters'
import type { TerminalPayment } from '../types'
import { PaymentStatusBadge } from './payment-status-badge'

type PaymentsTableProps = {
    payments: TerminalPayment[]
    /** Id of the payment being reconciled, if any. */
    reconcilingId: string | null
    onReconcile: (payment: TerminalPayment) => void
}

export function PaymentsTable({ payments, reconcilingId, onReconcile }: PaymentsTableProps) {
    return (
        <div className="bg-card rounded-2xl border border-border overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-muted text-muted-foreground font-bold text-xs uppercase tracking-wider">
                    <tr>
                        <th className="p-4">Fecha</th>
                        <th className="p-4 text-right">Monto</th>
                        <th className="p-4">Método</th>
                        <th className="p-4">Estado</th>
                        <th className="p-4">Error</th>
                        <th className="p-4 text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {payments.map(payment => (
                        <tr key={payment.id}>
                            <td className="p-4 text-muted-foreground whitespace-nowrap">{formatDateTime(payment.created_at)}</td>
                            <td className="p-4 text-right font-medium text-foreground tabular-nums">{formatMoney(payment.monto)}</td>
                            <td className="p-4 text-foreground">{payment.metodo_pago}</td>
                            <td className="p-4"><PaymentStatusBadge estado={payment.estado} /></td>
                            <td className="p-4 text-muted-foreground max-w-xs">{payment.error ?? '-'}</td>
                            <td className="p-4">
                                <div className="flex justify-end items-center gap-3">
                                    {payment.venta_id && (
                                        <a
                                            href={`/ticket/${payment.venta_id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-brand hover:underline font-medium"
                                        >
                                            Ver venta
                                        </a>
                                    )}
                                    {canReconcile(payment.estado) && (
                                        <Button
                                            variant="secondary"
                                            onClick={() => onReconcile(payment)}
                                            loading={reconcilingId === payment.id}
                                            loadingLabel="Conciliando..."
                                            disabled={reconcilingId !== null}
                                            icon={<RefreshCw size={14} />}
                                            className="px-3 py-1.5 text-sm font-medium"
                                        >
                                            Conciliar
                                        </Button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
