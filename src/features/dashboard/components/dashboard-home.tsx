'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Activity, AlertCircle, AlertTriangle, DollarSign, ShoppingCart, Users } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { formatMoney } from '@/lib/money'
import { useDashboardSummary } from '../hooks/use-dashboard-summary'

/** Landing page of the dashboard: KPIs of the day and quick actions. */
export function DashboardHome() {
    const router = useRouter()
    const { salesToday, cashStatus, lowStockCount, loading, error } = useDashboardSummary()

    const totalSalesAmount = salesToday.reduce((acc, sale) => acc + sale.total, 0)
    const cashStateColor = cashStatus?.estado === 'abierta' ? 'text-green-600 bg-green-100' : 'text-amber-600 bg-amber-100'

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Panel Principal</h1>
                <p className="text-muted-foreground">Resumen de actividad diaria</p>
            </div>

            {loading ? (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Skeleton className="h-40 rounded-2xl" />
                        <Skeleton className="h-40 rounded-2xl" />
                        <Skeleton className="h-40 rounded-2xl" />
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="p-6 bg-card rounded-2xl shadow-sm border border-border">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-brand/10 rounded-xl">
                                <DollarSign className="w-6 h-6 text-brand" />
                            </div>
                            <span className="text-sm font-medium text-muted-foreground">Hoy</span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Ventas Totales</p>
                            <h3 className="text-3xl font-bold text-foreground mt-1">
                                {formatMoney(totalSalesAmount)}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">{salesToday.length} transacciones</p>
                        </div>
                    </div>

                    <div className="p-6 bg-card rounded-2xl shadow-sm border border-border">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl ${cashStateColor}`}>
                                <Activity className="w-6 h-6" />
                            </div>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium uppercase ${cashStateColor}`}>
                                {cashStatus?.estado || 'Cerrada'}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Caja Actual</p>
                            <h3 className="text-3xl font-bold text-foreground mt-1">
                                {formatMoney(cashStatus?.monto_apertura ?? 0)}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                {cashStatus?.fecha_apertura ? new Date(cashStatus.fecha_apertura).toLocaleTimeString() : 'Sin actividad'}
                            </p>
                        </div>
                    </div>

                    <Link
                        href="/dashboard/stock-bajo"
                        className="p-6 bg-card rounded-2xl shadow-sm border border-border hover:border-brand/40 transition-colors"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl ${lowStockCount ? 'bg-amber-100 text-amber-600' : 'bg-brand/10 text-brand'}`}>
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <span className="text-sm font-medium text-muted-foreground">Inventario</span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Stock bajo</p>
                            <h3 className="text-3xl font-bold text-foreground mt-1">{lowStockCount ?? '-'}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                {lowStockCount === 0 ? 'Todo en orden' : 'variantes bajo el mínimo'}
                            </p>
                        </div>
                    </Link>

                    <div className="p-6 bg-gradient-to-br from-brand to-brand-light rounded-2xl shadow-lg text-white">
                        <h3 className="text-lg font-bold mb-4">Acciones Rápidas</h3>
                        <div className="space-y-3">
                            <button
                                onClick={() => router.push('/dashboard/venta')}
                                className="w-full py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-sm font-medium transition-colors text-left px-4 flex items-center gap-3"
                            >
                                <ShoppingCart size={18} /> Nueva Venta
                            </button>
                            <button
                                onClick={() => router.push('/dashboard/clientes')}
                                className="w-full py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-sm font-medium transition-colors text-left px-4 flex items-center gap-3"
                            >
                                <Users size={18} /> Nuevo Cliente
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3">
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}
        </div>
    )
}
