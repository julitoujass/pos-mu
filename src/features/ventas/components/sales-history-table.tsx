import { Eye } from 'lucide-react'
import { formatMoney } from '@/lib/money'
import type { SaleListItem } from '../types'
import { SaleStatusBadge } from './sale-status-badge'

type SalesHistoryTableProps = {
    sales: SaleListItem[]
    onViewDetail: (sale: SaleListItem) => void
}

export function SalesHistoryTable({ sales, onViewDetail }: SalesHistoryTableProps) {
    return (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted text-muted-foreground font-bold text-xs uppercase tracking-wider">
                        <tr>
                            <th className="p-4">Fecha</th>
                            <th className="p-4">Cliente</th>
                            <th className="p-4">Vendedor</th>
                            <th className="p-4">Método</th>
                            <th className="p-4 text-right">Total</th>
                            <th className="p-4">Estado</th>
                            <th className="p-4"><span className="sr-only">Acciones</span></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {sales.map(sale => (
                            <tr key={sale.id} className={`hover:bg-muted/50 ${sale.estado === 'anulada' ? 'opacity-70' : ''}`}>
                                <td className="p-4 whitespace-nowrap text-foreground">
                                    {new Date(sale.created_at).toLocaleString('es-AR')}
                                </td>
                                <td className="p-4 text-foreground">{sale.cliente?.nombre ?? 'Consumidor Final'}</td>
                                <td className="p-4 text-muted-foreground">{sale.usuario?.nombre ?? '-'}</td>
                                <td className="p-4 text-muted-foreground">{sale.metodo_pago}</td>
                                <td className={`p-4 text-right font-medium text-foreground ${sale.estado === 'anulada' ? 'line-through' : ''}`}>
                                    {formatMoney(sale.total)}
                                </td>
                                <td className="p-4"><SaleStatusBadge status={sale.estado} /></td>
                                <td className="p-4 text-right">
                                    <button
                                        onClick={() => onViewDetail(sale)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-brand bg-brand/10 hover:bg-brand/20 transition-colors"
                                    >
                                        <Eye size={14} />
                                        Ver detalle
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
