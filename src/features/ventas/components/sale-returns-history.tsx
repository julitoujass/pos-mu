import { formatDateTime } from '@/lib/dates'
import { Undo2 } from 'lucide-react'
import { formatMoney } from '@/lib/money'
import type { SaleDetail } from '../types'

/** Partial returns registered on a sale (nothing is rendered when there are none). */
export function SaleReturnsHistory({ sale }: { sale: SaleDetail }) {
    const returns = sale.devoluciones ?? []
    if (returns.length === 0) return null

    function itemLabel(varianteId: string): string {
        return sale.items.find(i => i.variante_id === varianteId)?.producto_nombre ?? 'Producto'
    }

    return (
        <div className="space-y-2">
            <h4 className="text-xs uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-2">
                <Undo2 size={14} />
                Devoluciones
            </h4>
            <ul className="space-y-2">
                {returns.map(ret => (
                    <li key={ret.id} className="p-3 rounded-xl border border-border bg-muted/30 text-sm space-y-1">
                        <div className="flex justify-between gap-2">
                            <span className="text-muted-foreground">
                                {formatDateTime(ret.created_at)}
                                {ret.usuario && ` · ${ret.usuario.nombre}`}
                            </span>
                            <span className="font-bold text-foreground">-{formatMoney(ret.monto)}</span>
                        </div>
                        <p className="text-foreground">{ret.motivo}</p>
                        <p className="text-xs text-muted-foreground">
                            {ret.items.map(i => `${i.cantidad} x ${itemLabel(i.variante_id)}`).join(', ')}
                            {` · Reintegro en ${ret.metodo_pago}`}
                        </p>
                    </li>
                ))}
            </ul>
        </div>
    )
}
