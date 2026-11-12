'use client'

import { useState } from 'react'
import { AlertCircle, BarChart2, RefreshCw } from 'lucide-react'
import { AdminOnly } from '@/features/auth'
import { DEFAULT_PRESET, PRESETS } from '../date-presets'
import { useReportes } from '../hooks/use-reportes'
import { CashReportTable } from './cash-report-table'
import { DateRangeSelector } from './date-range-selector'
import { KpiCards } from './kpi-cards'
import { ReportesSkeleton } from './report-states'
import { SalesByDayChart } from './sales-by-day-chart'
import { TopProducts } from './top-products'

export function ReportesPage() {
    return (
        <AdminOnly>
            <ReportesContent />
        </AdminOnly>
    )
}

function ReportesContent() {
    const [preset, setPreset] = useState(DEFAULT_PRESET)
    const [fechaInicio, setFechaInicio] = useState(PRESETS[DEFAULT_PRESET].start)
    const [fechaFin, setFechaFin] = useState(PRESETS[DEFAULT_PRESET].end)
    const [customRange, setCustomRange] = useState(false)

    const { ventas, topProductos, cajas, loading, error, reload } = useReportes(fechaInicio, fechaFin)

    function selectPreset(idx: number) {
        setPreset(idx)
        setCustomRange(false)
        setFechaInicio(PRESETS[idx].start)
        setFechaFin(PRESETS[idx].end)
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                        <BarChart2 className="text-brand" />
                        Reportes
                    </h1>
                    <p className="text-muted-foreground mt-1">Análisis de ventas, productos y caja</p>
                </div>
                <button
                    onClick={reload}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-xl text-sm font-medium hover:bg-muted/80 transition-colors disabled:opacity-50 self-start sm:self-auto"
                >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    Actualizar
                </button>
            </div>

            <DateRangeSelector
                preset={preset}
                customRange={customRange}
                fechaInicio={fechaInicio}
                fechaFin={fechaFin}
                onSelectPreset={selectPreset}
                onSelectCustom={() => setCustomRange(true)}
                onFechaInicioChange={setFechaInicio}
                onFechaFinChange={setFechaFin}
            />

            {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl flex items-center gap-3">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                </div>
            )}

            {loading ? <ReportesSkeleton /> : (
                <>
                    <KpiCards ventas={ventas} cajas={cajas} />
                    <SalesByDayChart ventas={ventas} />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <TopProducts productos={topProductos} />
                        <CashReportTable cajas={cajas} />
                    </div>
                </>
            )}
        </div>
    )
}
