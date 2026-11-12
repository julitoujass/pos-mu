import { DollarSign } from 'lucide-react'
import { formatMoney } from '@/lib/money'
import type { CashSummary } from '../types'

/** Sales of the current shift, total and by payment method. */
export function ShiftSalesSummary({ summary }: { summary: CashSummary | null }) {
    const byMethod: [string, number][] = summary
        ? [
            ['Efectivo', summary.ventas_efectivo],
            ['Tarjeta', summary.ventas_tarjeta],
            ['QR', summary.ventas_qr],
        ]
        : []
    const totalVentas = byMethod.reduce((acc, [, amount]) => acc + amount, 0)

    return (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-border bg-muted/30">
                <h3 className="font-bold text-foreground flex items-center gap-2">
                    <DollarSign size={20} /> Resumen de Ventas del Turno
                </h3>
            </div>
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-brand/10 border border-brand/20 p-4 rounded-xl text-center md:col-span-4 lg:col-span-1 flex flex-col justify-center">
                        <p className="text-sm font-bold text-brand uppercase tracking-wider mb-1">Total Pagado</p>
                        <p className="text-3xl font-bold text-foreground">{formatMoney(totalVentas)}</p>
                    </div>
                    <div className="md:col-span-4 lg:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-4">
                        {byMethod.map(([method, amount]) => (
                            <div key={method} className="bg-muted/50 border border-border p-4 rounded-xl text-center flex flex-col justify-center">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{method}</p>
                                <p className="text-lg font-bold text-foreground">{formatMoney(amount)}</p>
                            </div>
                        ))}
                        {(!summary || summary.cantidad_ventas === 0) && (
                            <div className="col-span-full py-4 text-center text-muted-foreground text-sm">
                                No se han registrado ventas en este turno.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
