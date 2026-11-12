'use client'

import { formatTime } from '@/lib/dates'
import { useState } from 'react'
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react'
import { formatMoney } from '@/lib/money'
import type { CashMovementType, CashStatusResponse, CashSummary } from '../types'
import { MovementModal } from './movement-modal'

type CashSummaryCardsProps = {
    status: CashStatusResponse
    summary: CashSummary | null
    /** Called after a movement is registered. */
    onSuccess: () => void
}

/** Expected-cash breakdown plus the "register ingreso/egreso" actions. */
export function CashSummaryCards({ status, summary, onSuccess }: CashSummaryCardsProps) {
    const [modalType, setModalType] = useState<CashMovementType | null>(null)

    // The backend is the source of truth for the session balance
    // (apertura + cash sales of this session + ingresos - egresos).
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col justify-between">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">Efectivo esperado</p>
                    <h3 className="text-4xl font-bold text-foreground mt-2">
                        {summary ? formatMoney(summary.esperado_efectivo) : '—'}
                    </h3>
                </div>
                <div className="mt-4 text-xs text-muted-foreground space-y-1">
                    <div>Apertura: {formatMoney(summary?.monto_apertura ?? status.monto_apertura ?? 0)}</div>
                    <div>Ventas en efectivo: <span className="text-green-600 font-medium">{summary ? `+${formatMoney(summary.ventas_efectivo)}` : '—'}</span></div>
                    <div>Ventas con tarjeta: {summary ? formatMoney(summary.ventas_tarjeta) : '—'}</div>
                    <div>Ventas QR: {summary ? formatMoney(summary.ventas_qr) : '—'}</div>
                    <div>Ingresos: <span className="text-green-600 font-medium">{summary ? `+${formatMoney(summary.ingresos)}` : '—'}</span></div>
                    <div>Egresos: <span className="text-red-600 font-medium">{summary ? `-${formatMoney(summary.egresos)}` : '—'}</span></div>
                    <div>Abierta desde: {formatTime(status.fecha_apertura)}</div>
                </div>
            </div>

            <button
                onClick={() => setModalType('ingreso')}
                className="bg-card p-6 rounded-2xl border border-border shadow-sm hover:border-brand/50 hover:bg-muted/50 transition-all flex flex-col items-center justify-center gap-3 group text-center"
            >
                <div className="w-12 h-12 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ArrowUpCircle size={24} />
                </div>
                <span className="font-medium text-foreground">Registrar Ingreso</span>
            </button>

            <button
                onClick={() => setModalType('egreso')}
                className="bg-card p-6 rounded-2xl border border-border shadow-sm hover:border-brand/50 hover:bg-muted/50 transition-all flex flex-col items-center justify-center gap-3 group text-center"
            >
                <div className="w-12 h-12 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ArrowDownCircle size={24} />
                </div>
                <span className="font-medium text-foreground">Registrar Egreso</span>
            </button>

            {modalType && (
                <MovementModal initialType={modalType} onClose={() => setModalType(null)} onSuccess={onSuccess} />
            )}
        </div>
    )
}
