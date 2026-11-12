import { formatTime } from '@/lib/dates'
import { History } from 'lucide-react'
import { formatMoney } from '@/lib/money'
import type { CashMovement } from '../types'

type MovementsDataTableProps = {
    movements: CashMovement[]
    /** Row shown when there are no movements. */
    emptyMessage?: string
}

/** Bare movements table, shared by the current shift and the session history. */
export function MovementsDataTable({ movements, emptyMessage }: MovementsDataTableProps) {
    return (
        <table className="w-full text-left text-sm">
            <thead className="bg-muted text-muted-foreground font-medium">
                <tr>
                    <th className="p-4">Hora</th>
                    <th className="p-4">Tipo</th>
                    <th className="p-4">Motivo</th>
                    <th className="p-4 text-right">Monto</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-border">
                {movements.length === 0 && emptyMessage && (
                    <tr>
                        <td colSpan={4} className="p-8 text-center text-muted-foreground">
                            {emptyMessage}
                        </td>
                    </tr>
                )}
                {movements.map(m => (
                    <tr key={m.id} className="hover:bg-muted/30">
                        <td className="p-4 whitespace-nowrap font-mono text-muted-foreground">
                            {formatTime(m.created_at)}
                        </td>
                        <td className="p-4">
                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${m.tipo === 'ingreso' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                {m.tipo}
                            </span>
                        </td>
                        <td className="p-4 text-foreground font-medium">
                            {m.motivo || m.descripcion}
                        </td>
                        <td className={`p-4 text-right font-bold font-mono ${m.tipo === 'ingreso' ? 'text-green-700' : 'text-red-600'}`}>
                            {m.tipo === 'ingreso' ? '+' : '-'}{formatMoney(m.monto)}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}

/** Card with the manual movements of the current shift. */
export function MovementsTable({ movements }: { movements: CashMovement[] }) {
    return (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-border bg-muted/30">
                <h3 className="font-bold text-foreground flex items-center gap-2">
                    <History size={20} /> Historial de Movimientos
                </h3>
            </div>
            <div className="overflow-x-auto">
                <MovementsDataTable
                    movements={movements}
                    emptyMessage="No hay movimientos registrados en este turno."
                />
            </div>
        </div>
    )
}
