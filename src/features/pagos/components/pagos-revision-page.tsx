'use client'

import { useState } from 'react'
import { CreditCard } from 'lucide-react'
import { toast } from 'sonner'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/ui/error-state'
import { Pagination } from '@/components/ui/pagination'
import { Refreshable } from '@/components/ui/refreshable'
import { TableSkeleton } from '@/components/ui/table-skeleton'
import { AdminOnly } from '@/features/auth'
import { getErrorMessage } from '@/lib/errors'
import { reconcilePayment } from '../api'
import { PAYMENTS_PAGE_SIZE, usePaymentsReview } from '../hooks/use-payments-review'
import { statusLabel } from '../payment-states'
import { FILTER_OPTIONS, type ReviewFilter } from '../review-filters'
import type { TerminalPayment } from '../types'
import { PaymentsTable } from './payments-table'

export function PagosRevisionPage() {
    return (
        <AdminOnly>
            <PagosRevisionContent />
        </AdminOnly>
    )
}

function PagosRevisionContent() {
    const review = usePaymentsReview()
    const [reconcilingId, setReconcilingId] = useState<string | null>(null)

    async function handleReconcile(payment: TerminalPayment) {
        setReconcilingId(payment.id)
        try {
            const updated = await reconcilePayment(payment.id)
            toast.success(`Pago conciliado: ${statusLabel(updated.estado)}`)
            review.reload()
        } catch (err: unknown) {
            toast.error(getErrorMessage(err, 'Error al conciliar el pago'))
        } finally {
            setReconcilingId(null)
        }
    }

    const from = review.total === 0 ? 0 : review.page * PAYMENTS_PAGE_SIZE + 1
    const to = Math.min(review.total, (review.page + 1) * PAYMENTS_PAGE_SIZE)

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                    <CreditCard className="text-brand" />
                    Pagos a revisar
                </h1>
                <p className="text-muted-foreground mt-1">
                    Cobros con terminal que quedaron sin resolver o con error al registrar la venta
                </p>
            </div>

            <div className="bg-card p-4 rounded-2xl border border-border max-w-xs">
                <label className="block">
                    <span className="block text-xs uppercase font-bold text-muted-foreground tracking-wider mb-1">Estado</span>
                    <select
                        value={review.filter}
                        onChange={e => review.setFilter(e.target.value as ReviewFilter)}
                        className="w-full px-3 py-2 rounded-xl border border-input bg-card text-foreground text-sm focus:ring-2 focus:ring-brand focus:border-transparent"
                    >
                        {FILTER_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                </label>
            </div>

            {review.error && <ErrorState message={review.error} onRetry={review.reload} />}

            {review.loading ? (
                <TableSkeleton columns={6} />
            ) : review.payments.length === 0 ? (
                !review.error && (
                    <Refreshable refreshing={review.refreshing}>
                        <EmptyState icon={CreditCard} message="No hay pagos para este filtro" />
                    </Refreshable>
                )
            ) : (
                <>
                    <Refreshable refreshing={review.refreshing}>
                        <PaymentsTable
                            payments={review.payments}
                            reconcilingId={reconcilingId}
                            onReconcile={handleReconcile}
                        />
                    </Refreshable>
                    {review.paginated && (
                        <Pagination
                            page={review.page}
                            pageCount={review.pageCount}
                            onPageChange={review.setPage}
                            summary={`${from}-${to} de ${review.total}`}
                            disabled={review.refreshing}
                        />
                    )}
                </>
            )}
        </div>
    )
}
