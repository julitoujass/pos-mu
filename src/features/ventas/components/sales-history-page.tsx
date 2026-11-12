'use client'

import { useState } from 'react'
import { Receipt } from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/ui/error-state'
import { Pagination } from '@/components/ui/pagination'
import { Refreshable } from '@/components/ui/refreshable'
import { TableSkeleton } from '@/components/ui/table-skeleton'
import { HISTORY_PAGE_SIZE, useSalesHistory } from '../hooks/use-sales-history'
import { ExportSalesButton } from './export-sales-button'
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Historial de Ventas</h1>
                    <p className="text-muted-foreground">Consultá las ventas registradas y sus detalles</p>
                </div>
                <ExportSalesButton filters={history.filters} />
            </div>

            <SalesHistoryFilters filters={history.filters} onChange={history.setFilters} />

            {history.error && <ErrorState message={history.error} onRetry={history.reload} />}

            {history.loading ? (
                <TableSkeleton columns={7} />
            ) : history.sales.length === 0 ? (
                !history.error && (
                    <Refreshable refreshing={history.refreshing}>
                        <EmptyState icon={Receipt} message="No hay ventas para los filtros seleccionados" />
                    </Refreshable>
                )
            ) : (
                <>
                    <Refreshable refreshing={history.refreshing}>
                        <SalesHistoryTable
                            sales={history.sales}
                            onViewDetail={sale => setSelectedSaleId(sale.id)}
                        />
                    </Refreshable>
                    <Pagination
                        page={history.page}
                        pageCount={history.pageCount}
                        onPageChange={history.setPage}
                        summary={`${from}-${to} de ${history.total}`}
                        disabled={history.refreshing}
                    />
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
