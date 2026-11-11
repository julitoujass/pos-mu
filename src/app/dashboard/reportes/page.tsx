'use client'

import { useState, useEffect, useCallback } from 'react'
import {
    fetchReporteVentas,
    fetchReporteProductosTop,
    fetchReporteCajas,
    VentasTotalesReporte,
    ProductoTopReporte,
    CajaResumenReporte
} from '@/lib/api'
import {
    BarChart2,
    TrendingUp,
    Package,
    Banknote,
    AlertCircle,
    Loader2,
    RefreshCw,
    Calendar,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

// ---- Helpers ----
function fmt(n: number) {
    return `$${n.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}
function fmtDate(iso: string) {
    return new Date(iso + 'T00:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })
}

// ---- Preset ranges ----
const today = new Date()
function isoDate(d: Date) { return d.toISOString().split('T')[0] }
function addDays(d: Date, n: number) { const r = new Date(d); r.setDate(r.getDate() + n); return r }

const PRESETS = [
    { label: 'Hoy', start: isoDate(today), end: isoDate(today) },
    { label: '7 días', start: isoDate(addDays(today, -6)), end: isoDate(today) },
    { label: '30 días', start: isoDate(addDays(today, -29)), end: isoDate(today) },
    { label: 'Este mes', start: isoDate(new Date(today.getFullYear(), today.getMonth(), 1)), end: isoDate(today) },
]

export default function ReportesPage() {
    const [preset, setPreset] = useState(1) // default: 7 días
    const [fechaInicio, setFechaInicio] = useState(PRESETS[1].start)
    const [fechaFin, setFechaFin] = useState(PRESETS[1].end)
    const [customRange, setCustomRange] = useState(false)

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [ventas, setVentas] = useState<VentasTotalesReporte | null>(null)
    const [topProductos, setTopProductos] = useState<ProductoTopReporte[]>([])
    const [cajas, setCajas] = useState<CajaResumenReporte | null>(null)

    const load = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const [v, tp, c] = await Promise.all([
                fetchReporteVentas(fechaInicio, fechaFin),
                fetchReporteProductosTop(fechaInicio, fechaFin).catch(() => []),
                fetchReporteCajas(fechaInicio, fechaFin)
            ])
            setVentas(v)
            setTopProductos(tp)
            setCajas(c)
        } catch (err: any) {
            setError(err?.message || 'Error al cargar reportes')
        } finally {
            setLoading(false)
        }
    }, [fechaInicio, fechaFin])

    useEffect(() => { load() }, [load])

    function selectPreset(idx: number) {
        setPreset(idx)
        setCustomRange(false)
        setFechaInicio(PRESETS[idx].start)
        setFechaFin(PRESETS[idx].end)
    }

    // Bar chart helpers
    const maxVentaDia = ventas ? Math.max(...ventas.ventas_por_dia.map(d => d.total), 1) : 1
    const maxTopIngreso = topProductos.length > 0 ? Math.max(...topProductos.map(p => p.ingresos_generados), 1) : 1

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                        <BarChart2 className="text-brand" />
                        Reportes
                    </h1>
                    <p className="text-muted-foreground mt-1">Análisis de ventas, productos y caja</p>
                </div>
                <button
                    onClick={load}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-xl text-sm font-medium hover:bg-muted/80 transition-colors disabled:opacity-50 self-start sm:self-auto"
                >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    Actualizar
                </button>
            </div>

            {/* Date Range Selector */}
            <div className="bg-card border border-border rounded-2xl p-4 flex flex-wrap items-center gap-3">
                <Calendar size={18} className="text-muted-foreground shrink-0" />
                <div className="flex flex-wrap gap-2">
                    {PRESETS.map((p, i) => (
                        <button
                            key={p.label}
                            onClick={() => selectPreset(i)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${!customRange && preset === i
                                ? 'bg-brand text-white shadow-md shadow-brand/20'
                                : 'bg-muted text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            {p.label}
                        </button>
                    ))}
                    <button
                        onClick={() => setCustomRange(true)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${customRange
                            ? 'bg-brand text-white shadow-md shadow-brand/20'
                            : 'bg-muted text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        Personalizado
                    </button>
                </div>

                {customRange && (
                    <div className="flex items-center gap-2 ml-auto">
                        <input type="date" value={fechaInicio}
                            onChange={e => setFechaInicio(e.target.value)}
                            className="px-3 py-1.5 rounded-lg border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-brand"
                        />
                        <span className="text-muted-foreground text-sm">→</span>
                        <input type="date" value={fechaFin}
                            onChange={e => setFechaFin(e.target.value)}
                            className="px-3 py-1.5 rounded-lg border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-brand"
                        />
                    </div>
                )}
            </div>

            {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl flex items-center gap-3">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                </div>
            )}

            {loading ? <ReportesSkeleton /> : (
                <>
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        <KpiCard
                            label="Ingresos Totales"
                            value={fmt(ventas?.total_ingresos ?? 0)}
                            icon={<TrendingUp className="w-5 h-5 text-brand" />}
                            accent="brand"
                        />
                        <KpiCard
                            label="Operaciones"
                            value={String(ventas?.cantidad_operaciones ?? 0)}
                            icon={<BarChart2 className="w-5 h-5 text-violet-500" />}
                            accent="violet"
                        />
                        <KpiCard
                            label="Ticket Promedio"
                            value={ventas && ventas.cantidad_operaciones > 0
                                ? fmt(ventas.total_ingresos / ventas.cantidad_operaciones)
                                : '$0'}
                            icon={<ArrowUpRight className="w-5 h-5 text-emerald-500" />}
                            accent="emerald"
                        />
                        <KpiCard
                            label="Diferencia de Caja"
                            value={fmt(cajas?.diferencia_total_periodo ?? 0)}
                            icon={<Banknote className="w-5 h-5 text-amber-500" />}
                            accent="amber"
                            negative={(cajas?.diferencia_total_periodo ?? 0) < 0}
                        />
                    </div>

                    {/* Ventas por Día */}
                    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                            <TrendingUp size={20} className="text-brand" />
                            Ventas por Día
                        </h2>
                        {!ventas || ventas.ventas_por_dia.length === 0 ? (
                            <EmptyState label="Sin ventas en el período seleccionado" />
                        ) : (
                            <div className="overflow-x-auto pb-2">
                                <div className="flex items-end gap-2 min-w-max" style={{ height: 180 }}>
                                    {ventas.ventas_por_dia.map((d) => {
                                        const pct = Math.max((d.total / maxVentaDia) * 100, 2)
                                        return (
                                            <div key={d.fecha} className="flex flex-col items-center gap-1 group" style={{ minWidth: 48 }}>
                                                <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-medium">
                                                    {fmt(d.total)}
                                                </span>
                                                <div className="w-10 bg-brand/20 rounded-t-lg overflow-hidden flex items-end" style={{ height: 140 }}>
                                                    <div
                                                        className="w-full bg-gradient-to-t from-brand to-brand/60 rounded-t-lg transition-all duration-500"
                                                        style={{ height: `${pct}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-muted-foreground">{fmtDate(d.fecha)}</span>
                                                <span className="text-xs font-bold text-foreground">{d.cantidad_ventas}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                                <p className="text-xs text-muted-foreground mt-3 text-center">El número bajo cada barra indica cantidad de ventas</p>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Top Productos */}
                        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                                <Package size={20} className="text-brand" />
                                Top Productos
                            </h2>
                            {topProductos.length === 0 ? (
                                <EmptyState label="Sin datos de productos" />
                            ) : (
                                <div className="space-y-3">
                                    {topProductos.slice(0, 10).map((p, i) => {
                                        const pct = (p.ingresos_generados / maxTopIngreso) * 100
                                        return (
                                            <div key={p.variante_id} className="group">
                                                <div className="flex items-center justify-between mb-1 gap-2">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <span className="text-xs font-bold text-muted-foreground w-5 shrink-0">#{i + 1}</span>
                                                        <span className="text-sm font-medium text-foreground truncate">{p.nombre_producto}</span>
                                                        <div className="flex gap-1 shrink-0">
                                                            {p.talle && <span className="px-1.5 py-0.5 bg-muted rounded text-xs text-muted-foreground">{p.talle}</span>}
                                                            {p.color && <span className="px-1.5 py-0.5 bg-muted rounded text-xs text-muted-foreground">{p.color}</span>}
                                                        </div>
                                                    </div>
                                                    <div className="text-right shrink-0">
                                                        <div className="text-sm font-bold text-foreground">{fmt(p.ingresos_generados)}</div>
                                                        <div className="text-xs text-muted-foreground">{p.cantidad_vendida} uds.</div>
                                                    </div>
                                                </div>
                                                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-brand to-brand/60 rounded-full transition-all duration-700"
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Resumen de Cajas */}
                        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                                <Banknote size={20} className="text-brand" />
                                Resumen de Cajas
                            </h2>
                            {!cajas || cajas.resumen_diario.length === 0 ? (
                                <EmptyState label="Sin sesiones de caja en el período" />
                            ) : (
                                <div className="space-y-0 overflow-hidden rounded-xl border border-border">
                                    <div className="grid grid-cols-4 gap-0 bg-muted text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                        <div className="p-3">Fecha</div>
                                        <div className="p-3 text-right">Ventas</div>
                                        <div className="p-3 text-right">Real</div>
                                        <div className="p-3 text-right">Dif.</div>
                                    </div>
                                    {cajas.resumen_diario.map((d) => {
                                        const dif = d.diferencia_esperado_vs_real
                                        const isNeg = dif < 0
                                        return (
                                            <div key={d.fecha} className="grid grid-cols-4 gap-0 border-t border-border hover:bg-muted/30 transition-colors text-sm">
                                                <div className="p-3 text-foreground font-medium">{fmtDate(d.fecha)}</div>
                                                <div className="p-3 text-right text-muted-foreground">{fmt(d.ingresos + d.monto_inicial_total)}</div>
                                                <div className="p-3 text-right text-foreground">{fmt(d.monto_real_efectivo_total)}</div>
                                                <div className={`p-3 text-right font-bold flex items-center justify-end gap-1 ${isNeg ? 'text-red-500' : 'text-emerald-500'}`}>
                                                    {isNeg ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
                                                    {fmt(Math.abs(dif))}
                                                </div>
                                            </div>
                                        )
                                    })}
                                    <div className="grid grid-cols-4 gap-0 border-t-2 border-border bg-muted/50">
                                        <div className="p-3 text-sm font-bold text-foreground col-span-3 text-right">Diferencia Total</div>
                                        <div className={`p-3 text-right font-bold text-sm ${(cajas.diferencia_total_periodo) < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                                            {fmt(cajas.diferencia_total_periodo)}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

// ---- Sub-components ----

function KpiCard({ label, value, icon, accent, negative }: {
    label: string; value: string; icon: React.ReactNode; accent: string; negative?: boolean
}) {
    const accentMap: Record<string, string> = {
        brand: 'bg-brand/10 border-brand/20',
        violet: 'bg-violet-500/10 border-violet-500/20',
        emerald: 'bg-emerald-500/10 border-emerald-500/20',
        amber: 'bg-amber-500/10 border-amber-500/20',
    }
    return (
        <div className={`p-5 rounded-2xl border shadow-sm bg-card transition-transform hover:-translate-y-0.5 ${accentMap[accent] || ''}`}>
            <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-muted-foreground">{label}</span>
                <div className="p-2 bg-card rounded-lg shadow-sm border border-border">{icon}</div>
            </div>
            <div className={`text-3xl font-black tracking-tight ${negative ? 'text-red-500' : 'text-foreground'}`}>
                {value}
            </div>
        </div>
    )
}

function EmptyState({ label }: { label: string }) {
    return (
        <div className="text-center py-12 text-muted-foreground">
            <BarChart2 size={36} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm">{label}</p>
        </div>
    )
}

function ReportesSkeleton() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}
            </div>
            <Skeleton className="h-64 rounded-2xl" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Skeleton className="h-80 rounded-2xl" />
                <Skeleton className="h-80 rounded-2xl" />
            </div>
        </div>
    )
}
