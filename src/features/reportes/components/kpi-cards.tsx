import React from 'react'
import { ArrowUpRight, Banknote, BarChart2, TrendingUp, Undo2, Wallet } from 'lucide-react'
import { formatWholeMoney } from '../format'
import type { CajaResumenReporte, VentasTotalesReporte } from '../types'

const ACCENT_CLASS = {
    brand: 'bg-brand/10 border-brand/20',
    violet: 'bg-violet-500/10 border-violet-500/20',
    emerald: 'bg-emerald-500/10 border-emerald-500/20',
    amber: 'bg-amber-500/10 border-amber-500/20',
    sky: 'bg-sky-500/10 border-sky-500/20',
    red: 'bg-red-500/10 border-red-500/20',
} as const

type KpiCardProps = {
    label: string
    value: string
    icon: React.ReactNode
    accent: keyof typeof ACCENT_CLASS
    negative?: boolean
}

function KpiCard({ label, value, icon, accent, negative }: KpiCardProps) {
    return (
        <div className={`p-5 rounded-2xl border shadow-sm bg-card transition-transform hover:-translate-y-0.5 ${ACCENT_CLASS[accent]}`}>
            <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-muted-foreground">{label}</span>
                <div className="p-2 bg-card rounded-lg shadow-sm border border-border">{icon}</div>
            </div>
            <div className={`text-3xl font-black tracking-tight tabular-nums ${negative ? 'text-red-500' : 'text-foreground'}`}>
                {value}
            </div>
        </div>
    )
}

type KpiCardsProps = {
    ventas: VentasTotalesReporte | null
    cajas: CajaResumenReporte | null
}

export function KpiCards({ ventas, cajas }: KpiCardsProps) {
    const diferencia = cajas?.diferencia_total_periodo ?? 0

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <KpiCard
                label="Ingresos Netos"
                value={formatWholeMoney(ventas?.total_ingresos ?? 0)}
                icon={<TrendingUp className="w-5 h-5 text-brand" />}
                accent="brand"
            />
            <KpiCard
                label="Ingresos Brutos"
                value={formatWholeMoney(ventas?.total_bruto ?? 0)}
                icon={<Wallet className="w-5 h-5 text-sky-500" />}
                accent="sky"
            />
            <KpiCard
                label="Devoluciones"
                value={formatWholeMoney(ventas?.total_devoluciones ?? 0)}
                icon={<Undo2 className="w-5 h-5 text-red-500" />}
                accent="red"
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
                    ? formatWholeMoney(ventas.total_ingresos / ventas.cantidad_operaciones)
                    : '$0'}
                icon={<ArrowUpRight className="w-5 h-5 text-emerald-500" />}
                accent="emerald"
            />
            <KpiCard
                label="Diferencia de Caja"
                value={formatWholeMoney(diferencia)}
                icon={<Banknote className="w-5 h-5 text-amber-500" />}
                accent="amber"
                negative={diferencia < 0}
            />
        </div>
    )
}
