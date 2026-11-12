'use client'

import { formatDateTime } from '@/lib/dates'
import { useId, useState } from 'react'
import { Ban, Loader2, Printer, Receipt, Undo2, X } from 'lucide-react'
import { toast } from 'sonner'
import { FormError } from '@/components/ui/form-error'
import { Modal } from '@/components/ui/modal'
import { useCurrentUser } from '@/features/auth'
import { formatMoney } from '@/lib/money'
import { useSaleDetail } from '../hooks/use-sale-detail'
import type { SaleDetail } from '../types'
import { openTicket } from '../open-ticket'
import { canRegisterReturn } from '../returns'
import { CancelSaleDialog } from './cancel-sale-dialog'
import { CancellationInfo, ItemsTable, Row } from './sale-detail-parts'
import { SaleReturnsHistory } from './sale-returns-history'
import { SaleStatusBadge } from './sale-status-badge'
import { ReturnModal } from './return-modal'

type SaleDetailModalProps = {
    saleId: string
    onClose: () => void
    /** Called after the sale was cancelled so the list can refresh. */
    onChanged: () => void
}

/** Sale detail: header, items, discount/surcharge breakdown and (admin) cancellation. */
export function SaleDetailModal({ saleId, onClose, onChanged }: SaleDetailModalProps) {
    const titleId = useId()
    const { isAdmin } = useCurrentUser()
    const { sale, setSale, loading, error } = useSaleDetail(saleId)
    const [cancelling, setCancelling] = useState(false)
    const [returning, setReturning] = useState(false)

    function handleCancelled(updated: SaleDetail) {
        setSale(updated)
        setCancelling(false)
        toast.success('Venta anulada')
        onChanged()
    }

    function handleReturned(updated: SaleDetail) {
        setSale(updated)
        setReturning(false)
        toast.success('Devolución registrada')
        onChanged()
    }

    const hasReturns = (sale?.devoluciones?.length ?? 0) > 0

    return (
        <>
            <Modal
                onClose={onClose}
                labelledBy={titleId}
                backdrop="strong"
                className="bg-card w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col rounded-2xl shadow-2xl border border-border"
            >
                <div className="flex justify-between items-center p-6 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand/10 text-brand rounded-full flex items-center justify-center">
                            <Receipt size={20} />
                        </div>
                        <div>
                            <h3 id={titleId} className="text-xl font-bold text-foreground">Detalle de venta</h3>
                            {sale && (
                                <p className="text-sm text-muted-foreground">
                                    {formatDateTime(sale.created_at)}
                                </p>
                            )}
                        </div>
                    </div>
                    <button onClick={onClose} aria-label="Cerrar" className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 space-y-5">
                    {loading && (
                        <div className="flex justify-center p-12">
                            <Loader2 className="animate-spin text-muted-foreground w-8 h-8" />
                        </div>
                    )}
                    <FormError message={error} />

                    {sale && (
                        <>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                                <div>
                                    <p className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Cliente</p>
                                    <p className="text-foreground">{sale.cliente?.nombre ?? 'Consumidor Final'}</p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Vendedor</p>
                                    <p className="text-foreground">{sale.usuario?.nombre ?? '-'}</p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Método</p>
                                    <p className="text-foreground">{sale.metodo_pago}</p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Estado</p>
                                    <SaleStatusBadge status={sale.estado} />
                                </div>
                            </div>

                            {sale.estado === 'anulada' && <CancellationInfo sale={sale} />}

                            <ItemsTable sale={sale} isAdmin={isAdmin} />

                            <SaleReturnsHistory sale={sale} />

                            <div className="space-y-1 ml-auto max-w-xs">
                                <Row label="Subtotal" value={formatMoney(sale.subtotal)} />
                                {sale.descuento_aplicado > 0 && (
                                    <Row label="Descuento" value={`-${formatMoney(sale.descuento_aplicado)}`} tone="text-green-600 dark:text-green-400" />
                                )}
                                {sale.recargo_aplicado > 0 && (
                                    <Row label="Recargo" value={`+${formatMoney(sale.recargo_aplicado)}`} />
                                )}
                                {(sale.total_devuelto ?? 0) > 0 && (
                                    <Row label="Devuelto" value={`-${formatMoney(sale.total_devuelto ?? 0)}`} tone="text-amber-600 dark:text-amber-400" />
                                )}
                                <div className="flex justify-between text-lg font-bold text-foreground pt-1 border-t border-border">
                                    <span>Total</span>
                                    <span>{formatMoney(sale.total)}</span>
                                </div>
                                {isAdmin && sale.total_costo != null && (
                                    <Row label="Costo total" value={formatMoney(sale.total_costo)} />
                                )}
                            </div>
                        </>
                    )}
                </div>

                {sale && (
                    <div className="p-4 border-t border-border flex flex-wrap justify-end gap-3">
                        <button
                            onClick={() => openTicket(sale.id)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-foreground bg-muted hover:bg-muted/70 font-medium transition-colors"
                        >
                            <Printer size={16} />
                            Imprimir ticket
                        </button>
                        {isAdmin && canRegisterReturn(sale) && (
                            <button
                                onClick={() => setReturning(true)}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-brand bg-brand/10 hover:bg-brand/20 font-medium transition-colors"
                            >
                                <Undo2 size={16} />
                                Registrar devolución
                            </button>
                        )}
                        {isAdmin && sale.estado === 'completada' && !hasReturns && (
                            <button
                                onClick={() => setCancelling(true)}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-destructive bg-destructive/10 hover:bg-destructive/20 font-medium transition-colors"
                            >
                                <Ban size={16} />
                                Anular venta
                            </button>
                        )}
                    </div>
                )}
            </Modal>

            {returning && sale && (
                <ReturnModal sale={sale} onReturned={handleReturned} onClose={() => setReturning(false)} />
            )}

            {cancelling && (
                <CancelSaleDialog
                    saleId={saleId}
                    onCancelled={handleCancelled}
                    onClose={() => setCancelling(false)}
                />
            )}
        </>
    )
}
