'use client'

import { getErrorMessage } from '@/lib/errors'
import { formatMoney, parseMoneyInput } from '@/lib/money'
import { useState, useEffect } from 'react'
import {
    fetchCashStatus,
    openRegister,
    closeRegister,
    fetchCashMovements,
    createCashMovement,
    fetchCashSessions,
    fetchSessionMovements,
    fetchCashSummary,
    CashStatusResponse,
    CashMovement,
    CashSummary as CashSummaryData
} from '@/lib/api'
import {
    Loader2,
    Lock,
    Unlock,
    DollarSign,
    ArrowUpCircle,
    ArrowDownCircle,
    AlertCircle,
    History,
    X,
    CalendarDays
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

export default function CajaPage() {
    const [cashStatus, setCashStatus] = useState<CashStatusResponse | null>(null)
    const [movements, setMovements] = useState<CashMovement[]>([])
    const [summary, setSummary] = useState<CashSummaryData | null>(null)
    const [loading, setLoading] = useState(true)
    const [refreshTrigger, setRefreshTrigger] = useState(0)
    const [showSessionsModal, setShowSessionsModal] = useState(false)

    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true)
                const status = await fetchCashStatus()
                setCashStatus(status)

                if (status?.estado === 'abierta') {
                    const [movs, summaryData] = await Promise.all([
                        fetchCashMovements(),
                        fetchCashSummary()
                    ])
                    setMovements(movs)
                    setSummary(summaryData)
                } else {
                    setMovements([])
                    setSummary(null)
                }
            } catch (err: unknown) {
                toast.error(getErrorMessage(err, 'Error al cargar los datos de caja'))
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [refreshTrigger])

    function refresh() {
        setRefreshTrigger(p => p + 1)
    }

    if (loading && !cashStatus) {
        return (
            <div className="space-y-6">
                {/* Header Skeleton */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-32" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                    <Skeleton className="h-10 w-32 rounded-full" />
                </div>

                {/* Cards Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Skeleton className="h-40 rounded-2xl" />
                    <Skeleton className="h-40 rounded-2xl" />
                    <Skeleton className="h-40 rounded-2xl" />
                </div>

                {/* Table Skeleton */}
                <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-border bg-muted/30">
                        <Skeleton className="h-6 w-48" />
                    </div>
                    <div className="p-6 space-y-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Caja</h1>
                    <p className="text-muted-foreground">Gestión de turnos y movimientos</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <button
                        onClick={() => setShowSessionsModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-full text-sm font-medium hover:bg-muted/80 transition-colors"
                    >
                        <CalendarDays size={16} />
                        Sesiones Anteriores
                    </button>
                    {cashStatus?.estado === 'abierta' && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
                            <Unlock size={16} />
                            Caja Abierta
                        </div>
                    )}
                    {cashStatus?.estado === 'cerrada' && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-sm font-medium">
                            <Lock size={16} />
                            Caja Cerrada
                        </div>
                    )}
                </div>
            </div>

            {!cashStatus || cashStatus.estado === 'cerrada' ? (
                <OpenRegisterForm onSuccess={refresh} />
            ) : (
                <div className="space-y-6">
                    <CashSummary status={cashStatus} summary={summary} onSuccess={refresh} />
                    <ShiftSalesSummary summary={summary} />
                    <MovementsTable movements={movements} />
                    <CloseRegisterForm summary={summary} onSuccess={refresh} />
                </div>
            )}

            {showSessionsModal && (
                <SessionsHistoryModal onClose={() => setShowSessionsModal(false)} />
            )}
        </div>
    )
}

// ============ OPEN REGISTER FORM ============

function OpenRegisterForm({ onSuccess }: { onSuccess: () => void }) {
    const [amount, setAmount] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        const parsed = parseMoneyInput(amount)
        if (parsed === null) {
            setError('Ingresa un monto inicial válido (0 o mayor).')
            return
        }
        setLoading(true)
        setError(null)
        try {
            await openRegister({ monto_apertura: parsed })
            onSuccess()
        } catch (err: unknown) {
            setError(getErrorMessage(err, 'Error al abrir caja'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-card border border-border rounded-2xl p-8 max-w-md mx-auto shadow-lg text-center">
            <div className="w-16 h-16 bg-brand/10 text-brand rounded-full flex items-center justify-center mx-auto mb-6">
                <Unlock size={32} />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Apertura de Caja</h2>
            <p className="text-muted-foreground mb-6">Ingresa el monto inicial para comenzar el turno.</p>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
                <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Monto Inicial</label>
                    <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                        <input
                            type="text"
                            inputMode="decimal"
                            required
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-background text-foreground text-lg font-bold focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                            placeholder="0,00"
                        />
                    </div>
                </div>

                {error && (
                    <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm flex items-center gap-2">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading || !amount}
                    className="w-full py-3 rounded-xl bg-brand text-white font-bold hover:bg-brand-hover transition-colors shadow-lg shadow-brand/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading ? <Loader2 className="animate-spin" /> : 'Abrir Caja'}
                </button>
            </form>
        </div>
    )
}

// ============ CASH SUMMARY & ACTIONS ============

function CashSummary({ status, summary, onSuccess }: { status: CashStatusResponse, summary: CashSummaryData | null, onSuccess: () => void }) {
    const [modalType, setModalType] = useState<'ingreso' | 'egreso' | null>(null)

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
                    <div>Abierta desde: {new Date(status.fecha_apertura).toLocaleTimeString('es-AR')}</div>
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

// ============ SHIFT SALES SUMMARY ============

function ShiftSalesSummary({ summary }: { summary: CashSummaryData | null }) {
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

// ============ MOVEMENTS TABLE ============

function MovementsTable({ movements }: { movements: CashMovement[] }) {
    return (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-border bg-muted/30">
                <h3 className="font-bold text-foreground flex items-center gap-2">
                    <History size={20} /> Historial de Movimientos
                </h3>
            </div>
            <div className="overflow-x-auto">
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
                        {movements.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-muted-foreground">
                                    No hay movimientos registrados en este turno.
                                </td>
                            </tr>
                        ) : (
                            movements.map(m => (
                                <tr key={m.id} className="hover:bg-muted/30">
                                    <td className="p-4 whitespace-nowrap font-mono text-muted-foreground">
                                        {new Date(m.created_at).toLocaleTimeString()}
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
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

// ============ CLOSE REGISTER FORM ============

function CloseRegisterForm({ summary, onSuccess }: { summary: CashSummaryData | null, onSuccess: () => void }) {
    const [finalAmount, setFinalAmount] = useState('')
    const [notes, setNotes] = useState('')
    const [loading, setLoading] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [confirmAmount, setConfirmAmount] = useState(0)

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        const parsed = parseMoneyInput(finalAmount)
        if (parsed === null) {
            toast.error('Ingresa un monto real válido (0 o mayor).')
            return
        }
        setConfirmAmount(parsed)
        setShowConfirm(true)
    }

    async function executeClose() {
        setLoading(true)
        setShowConfirm(false)
        try {
            await closeRegister({
                monto_real_efectivo: confirmAmount,
                observaciones: notes.trim() || undefined
            })
            toast.success('Caja cerrada correctamente')
            onSuccess()
        } catch (err: unknown) {
            toast.error(getErrorMessage(err, 'Error al cerrar caja'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <h3 className="text-xl font-bold text-destructive mb-4 flex items-center gap-2">
                    <Lock size={20} /> Cerrar Caja
                </h3>
                <form
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end"
                >
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Monto Real en Efectivo</label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <input
                                type="text"
                                inputMode="decimal"
                                required
                                value={finalAmount}
                                onChange={(e) => setFinalAmount(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-input bg-background text-foreground font-bold focus:ring-2 focus:ring-destructive focus:border-transparent"
                                placeholder="0,00"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Notas / Observaciones</label>
                        <input
                            type="text"
                            value={notes}
                            maxLength={500}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-destructive focus:border-transparent"
                            placeholder="Todo en orden..."
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading || !finalAmount}
                        className="w-full py-2.5 rounded-xl bg-destructive text-white font-medium hover:bg-destructive/90 transition-colors shadow-lg shadow-destructive/20 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : 'Cerrar Turno'}
                    </button>
                </form>
            </div>

            {showConfirm && (
                <ConfirmCloseModal
                    amount={confirmAmount}
                    expected={summary ? summary.esperado_efectivo : null}
                    onConfirm={executeClose}
                    onCancel={() => setShowConfirm(false)}
                />
            )}
        </>
    )
}

// ============ CONFIRM CLOSE MODAL ============

function ConfirmCloseModal({
    amount,
    expected,
    onConfirm,
    onCancel
}: {
    amount: number;
    expected: number | null;
    onConfirm: () => void;
    onCancel: () => void;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-card rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-destructive/30 animate-in zoom-in-95 duration-200">
                <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
                        <Lock size={28} className="text-destructive" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-foreground">¿Cerrar el turno?</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Se registrará <span className="font-bold text-foreground">{formatMoney(amount)}</span> como efectivo real.
                            Esta acción no se puede deshacer.
                        </p>
                        {expected !== null && (
                            <div className="mt-3 text-sm text-muted-foreground space-y-1">
                                <div>Efectivo esperado: <span className="font-bold text-foreground">{formatMoney(expected)}</span></div>
                                <div>
                                    Diferencia:{' '}
                                    <span className={`font-bold ${Math.abs(amount - expected) < 0.005 ? 'text-green-600' : 'text-destructive'}`}>
                                        {formatMoney(amount - expected)}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex gap-3 w-full pt-2">
                        <button
                            onClick={onCancel}
                            className="flex-1 py-2.5 rounded-xl border border-input text-muted-foreground font-medium hover:bg-muted hover:text-foreground transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 py-2.5 rounded-xl bg-destructive text-white font-bold hover:bg-destructive/90 transition-colors shadow-lg shadow-destructive/20"
                        >
                            Sí, cerrar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ============ MOVEMENT MODAL ============

function MovementModal({ initialType, onClose, onSuccess }: { initialType: 'ingreso' | 'egreso', onClose: () => void, onSuccess: () => void }) {
    const [type, setType] = useState<'ingreso' | 'egreso'>(initialType)
    const [amount, setAmount] = useState('')
    const [desc, setDesc] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        setType(initialType)
    }, [initialType])

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        if (type !== 'ingreso' && type !== 'egreso') {
            toast.error('Tipo de movimiento inválido')
            return
        }
        const parsed = parseMoneyInput(amount)
        if (parsed === null || parsed <= 0) {
            toast.error('Ingresa un monto válido mayor a 0.')
            return
        }
        setLoading(true)
        try {
            await createCashMovement({
                tipo: type,
                monto: parsed,
                motivo: desc
            })
            onSuccess()
            onClose()
        } catch (err: unknown) {
            toast.error(getErrorMessage(err, 'Error al registrar movimiento'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-card w-full max-w-md p-6 rounded-2xl shadow-2xl border border-border">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-foreground">Nuevo Movimiento</h3>
                </div>

                <div className="flex bg-muted rounded-xl p-1 mb-6">
                    <button
                        type="button"
                        onClick={() => setType('ingreso')}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${type === 'ingreso' ? 'bg-background text-green-700 shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        Ingreso
                    </button>
                    <button
                        type="button"
                        onClick={() => setType('egreso')}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${type === 'egreso' ? 'bg-background text-red-600 shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        Egreso
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Monto</label>
                        <input
                            type="text"
                            inputMode="decimal"
                            required
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground font-bold text-lg focus:ring-2 focus:ring-brand focus:border-transparent"
                            placeholder="0,00"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Motivo</label>
                        <input
                            type="text"
                            required
                            value={desc}
                            onChange={(e) => setDesc(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-brand focus:border-transparent"
                            placeholder="Ej: Pago de limpieza..."
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 py-3 text-muted-foreground hover:text-foreground font-medium">Cancelar</button>
                        <button
                            type="submit"
                            disabled={loading || !amount}
                            className={`flex-1 py-3 rounded-xl text-white font-bold transition-all shadow-lg items-center justify-center flex gap-2 ${type === 'ingreso' ? 'bg-green-600 hover:bg-green-700 shadow-green-600/20' : 'bg-red-600 hover:bg-red-700 shadow-red-600/20'}`}
                        >
                            {loading && <Loader2 className="animate-spin w-5 h-5" />}
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// ============ SESSIONS HISTORY MODAL ============

function SessionsHistoryModal({ onClose }: { onClose: () => void }) {
    const [sessions, setSessions] = useState<CashStatusResponse[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedSession, setSelectedSession] = useState<CashStatusResponse | null>(null)
    const [movements, setMovements] = useState<CashMovement[]>([])
    const [loadingMovements, setLoadingMovements] = useState(false)

    useEffect(() => {
        async function load() {
            try {
                const data = await fetchCashSessions()
                // Sort sessions putting the newest first by fecha_apertura
                data.sort((a, b) => new Date(b.fecha_apertura).getTime() - new Date(a.fecha_apertura).getTime())
                setSessions(data)
            } catch {
                toast.error('Error al cargar sesiones')
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    async function handleViewMovements(session: CashStatusResponse) {
        setSelectedSession(session)
        setLoadingMovements(true)
        try {
            const data = await fetchSessionMovements(session.id)
            setMovements(data)
        } catch {
            toast.error('Error al cargar movimientos')
        } finally {
            setLoadingMovements(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-card w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col rounded-2xl shadow-2xl border border-border">
                <div className="flex justify-between items-center p-6 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand/10 text-brand rounded-full flex items-center justify-center">
                            <History size={20} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-foreground">
                                {selectedSession ? 'Movimientos de la Sesión' : 'Sesiones Anteriores'}
                            </h3>
                            {selectedSession && (
                                <p className="text-sm text-muted-foreground mt-0.5">
                                    Apertura: {new Date(selectedSession.fecha_apertura).toLocaleString('es-AR')}
                                </p>
                            )}
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {selectedSession ? (
                        <div className="space-y-4">
                            <button
                                onClick={() => setSelectedSession(null)}
                                className="text-sm text-brand font-medium hover:underline mb-2 inline-flex items-center gap-1"
                            >
                                ← Volver a sesiones
                            </button>

                            {loadingMovements ? (
                                <div className="flex justify-center p-12"><Loader2 className="animate-spin text-muted-foreground w-8 h-8" /></div>
                            ) : movements.length === 0 ? (
                                <div className="text-center bg-muted/30 py-12 rounded-2xl border border-dashed border-border">
                                    <p className="text-muted-foreground">No hay movimientos registrados en esta sesión.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto border border-border rounded-xl">
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
                                            {movements.map(m => (
                                                <tr key={m.id} className="hover:bg-muted/30">
                                                    <td className="p-4 whitespace-nowrap font-mono text-muted-foreground">
                                                        {new Date(m.created_at).toLocaleTimeString('es-AR')}
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
                                </div>
                            )}
                        </div>
                    ) : (
                        loading ? (
                            <div className="flex justify-center p-12"><Loader2 className="animate-spin text-muted-foreground w-8 h-8" /></div>
                        ) : sessions.length === 0 ? (
                            <div className="text-center bg-muted/30 py-12 rounded-2xl border border-dashed border-border">
                                <p className="text-muted-foreground">No hay sesiones anteriores registradas.</p>
                            </div>
                        ) : (
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
                                                    {new Date(s.fecha_apertura).toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                                </span>
                                            </div>
                                            <div className="text-sm text-muted-foreground flex items-center gap-3">
                                                <span><strong className="text-foreground/70">Apertura:</strong> {new Date(s.fecha_apertura).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</span>
                                                {s.fecha_cierre && (
                                                    <>
                                                        <span className="w-1.5 h-1.5 rounded-full bg-border"></span>
                                                        <span><strong className="text-foreground/70">Cierre:</strong> {new Date(s.fecha_cierre).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</span>
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
                                                onClick={() => handleViewMovements(s)}
                                                className="px-4 py-2 bg-brand/10 text-brand rounded-lg text-sm font-bold hover:bg-brand hover:text-white transition-colors shrink-0 flex items-center gap-2"
                                            >
                                                Ver Movimientos
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    )
}
