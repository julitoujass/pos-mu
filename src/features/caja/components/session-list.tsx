import { formatTime, formatLongDate } from '@/lib/dates'
import { CalendarDays } from 'lucide-react'
import { formatMoney } from '@/lib/money'
import type { CashStatusResponse } from '../types'


type SessionListProps = {
    sessions: CashStatusResponse[]
    onViewMovements: (session: CashStatusResponse) => void
}

/** Past cash sessions with their opening/closing amounts. */
export function SessionList({ sessions, onViewMovements }: SessionListProps) {
    return (
        <div className="grid gap-4">
            {sessions.map((s) => (
                <div key={s.id} className="bg-background border border-border rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-sm hover:border-brand/40 transition-all hover:shadow-md">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${s.estado === 'abierta' ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400'}`}>
                                {s.estado}
                            </span>
                            <span className="text-base font-bold text-foreground flex items-center gap-2">
                                <CalendarDays className="w-4 h-4 text-muted-foreground" />
                                {formatLongDate(s.fecha_apertura)}
                            </span>
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-3">
                            <span><strong className="text-foreground/70">Apertura:</strong> {formatTime(s.fecha_apertura)}</span>
                            {s.fecha_cierre && (
                                <>
                                    <span className="w-1.5 h-1.5 rounded-full bg-border"></span>
                                    <span><strong className="text-foreground/70">Cierre:</strong> {formatTime(s.fecha_cierre)}</span>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-6 md:gap-8">
                        <div className="flex gap-6">
                            <div className="flex flex-col">
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Inicial</span>
                                <span className="text-sm font-bold font-mono text-foreground">{formatMoney(s.monto_apertura)}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Cierre Real</span>
                                <span className="text-sm font-bold font-mono text-foreground">
                                    {s.monto_real_efectivo !== undefined && s.monto_real_efectivo !== null ? formatMoney(s.monto_real_efectivo) : '-'}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={() => onViewMovements(s)}
                            className="px-4 py-2 bg-brand/10 text-brand rounded-lg text-sm font-bold hover:bg-brand hover:text-white transition-colors shrink-0 flex items-center gap-2"
                        >
                            Ver Movimientos
                        </button>
                    </div>
                </div>
            ))}
        </div>
    )
}
