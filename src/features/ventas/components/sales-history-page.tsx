'use client'

import { useState } from 'react'
import { AlertCircle, ChevronLeft, ChevronRight, Receipt } from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { HISTORY_PAGE_SIZE, useSalesHistory } from '../hooks/use-sales-history'
import { SaleDetailModal } from './sale-detail-modal'
import { SalesHistoryFilters } from './sales-history-filters'
import { SalesHistoryTable } from './sales-history-table'

/** Sales history: filters, paginated list and per-sale detail. */
export function SalesHistoryPage() {
    const history = useSalesHistory()
    const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null)

    const from = history.total === 0 ? 0 : history.page * HISTORY_PAGE_SIZE + 1
    const to = Math.min(history.total, (history.page + 1) * HISTORY_PAGE_SIZE)

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Historial de Ventas</h1>
                <p className="text-muted-foreground">Consultá las ventas registradas y sus detalles</p>
            </div>

            <SalesHistoryFilters filters={history.filters} onChange={history.setFilters} />

            {history.error && (
                <div className="p-4 bg-destructive/10 text-destructive rounded-xl flex items-center gap-3">
                    <AlertCircle size={20} />
                    {history.error}
                </div>
            )}

            {history.loading ? (
                <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
                    {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
            ) : history.sales.length === 0 ? (
                <EmptyState icon={Receipt} message="No hay ventas para los filtros seleccionados" />
            ) : (
                <>
                    <SalesHistoryTable
                        sales={history.sales}
                        onViewDetail={sale => setSelectedSaleId(sale.id)}
                    />
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{from}-{to} de {history.total}</span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => history.setPage(history.page - 1)}
                                disabled={history.page === 0}
                                aria-label="Página anterior"
                                className="p-2 rounded-lg border border-input bg-card hover:bg-muted disabled:opacity-50 transition-colors"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span>Página {history.page + 1} de {history.pageCount}</span>
                            <button
                                onClick={() => history.setPage(history.page + 1)}
                                disabled={history.page + 1 >= history.pageCount}
                                aria-label="Página siguiente"
                                className="p-2 rounded-lg border border-input bg-card hover:bg-muted disabled:opacity-50 transition-colors"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </>
            )}

            {selectedSaleId && (
                <SaleDetailModal
                    saleId={selectedSaleId}
                    onClose={() => setSelectedSaleId(null)}
                    onChanged={history.reload}
                />
            )}
        </div>
    )
}
