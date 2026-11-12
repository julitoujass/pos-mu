'use client'

import { useState } from 'react'
import { BarChart2, RefreshCw } from 'lucide-react'
import { ErrorState } from '@/components/ui/error-state'
import { Refreshable } from '@/components/ui/refreshable'
import { AdminOnly } from '@/features/auth'
import { DEFAULT_PRESET, PRESETS } from '../date-presets'
import { useReportes } from '../hooks/use-reportes'
import { CashReportTable } from './cash-report-table'
import { ExportButtons } from './export-buttons'
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

    const { ventas, topProductos, cajas, loading, refreshing, error, reload } = useReportes(fechaInicio, fechaFin)
    const busy = loading || refreshing

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
                    disabled={busy}
                    className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-xl text-sm font-medium hover:bg-muted/80 transition-colors disabled:opacity-50 self-start sm:self-auto"
                >
                    <RefreshCw size={16} className={busy ? 'animate-spin' : ''} />
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

            {error && <ErrorState message={error} onRetry={reload} />}

            {loading ? <ReportesSkeleton /> : !ventas && error ? null : (
                <Refreshable refreshing={refreshing}>
                    <div className="space-y-8">
                    <KpiCards ventas={ventas} cajas={cajas} />
                    <ExportButtons
                        ventas={ventas}
                        topProductos={topProductos}
                        cajas={cajas}
                        fechaInicio={fechaInicio}
                        fechaFin={fechaFin}
                    />
                    <SalesByDayChart ventas={ventas} />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <TopProducts productos={topProductos} />
                        <CashReportTable cajas={cajas} />
                    </div>
                    </div>
                </Refreshable>
            )}
        </div>
    )
}
