'use client'

import { useId, useState } from 'react'
import { Ban, Loader2, Receipt, X } from 'lucide-react'
import { toast } from 'sonner'
import { FormError } from '@/components/ui/form-error'
import { Modal } from '@/components/ui/modal'
import { useCurrentUser } from '@/features/auth'
import { formatMoney } from '@/lib/money'
import { useSaleDetail } from '../hooks/use-sale-detail'
import type { SaleDetail } from '../types'
import { CancelSaleDialog } from './cancel-sale-dialog'
import { SaleStatusBadge } from './sale-status-badge'

type SaleDetailModalProps = {
    saleId: string
    onClose: () => void
    /** Called after the sale was cancelled so the list can refresh. */
    onChanged: () => void
}

function Row({ label, value, tone }: { label: string; value: string; tone?: string }) {
    return (
        <div className={`flex justify-between text-sm ${tone ?? 'text-muted-foreground'}`}>
            <span>{label}</span>
            <span className="font-medium">{value}</span>
        </div>
    )
}

function CancellationInfo({ sale }: { sale: SaleDetail }) {
    return (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm space-y-1">
            <p className="font-bold">Venta anulada</p>
            {sale.motivo_anulacion && <p>Motivo: {sale.motivo_anulacion}</p>}
            <p>
                {sale.anulada_at && `${new Date(sale.anulada_at).toLocaleString('es-AR')}`}
                {sale.anulada_por && ` por ${sale.anulada_por.nombre}`}
            </p>
        </div>
    )
}

function ItemsTable({ sale, isAdmin }: { sale: SaleDetail; isAdmin: boolean }) {
    return (
        <div className="overflow-x-auto border border-border rounded-xl">
            <table className="w-full text-sm text-left">
                <thead className="bg-muted text-muted-foreground text-xs uppercase tracking-wider">
                    <tr>
                        <th className="p-3">Producto</th>
                        <th className="p-3 text-center">Cant.</th>
                        <th className="p-3 text-right">Precio</th>
                        {isAdmin && <th className="p-3 text-right">Costo</th>}
                        <th className="p-3 text-right">Subtotal</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {sale.items.map(item => (
                        <tr key={item.variante_id}>
                            <td className="p-3">
                                <p className="font-medium text-foreground">{item.producto_nombre}</p>
                                <p className="text-xs text-muted-foreground">
                                    {[item.sku, item.talle, item.color].filter(Boolean).join(' · ') || '-'}
                                </p>
                            </td>
                            <td className="p-3 text-center text-foreground">{item.cantidad}</td>
                            <td className="p-3 text-right text-muted-foreground">{formatMoney(item.precio_unitario)}</td>
                            {isAdmin && (
                                <td className="p-3 text-right text-muted-foreground">
                                    {item.costo_unitario != null ? formatMoney(item.costo_unitario) : '-'}
                                </td>
                            )}
                            <td className="p-3 text-right font-medium text-foreground">{formatMoney(item.subtotal)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

/** Sale detail: header, items, discount/surcharge breakdown and (admin) cancellation. */
export function SaleDetailModal({ saleId, onClose, onChanged }: SaleDetailModalProps) {
    const titleId = useId()
    const { isAdmin } = useCurrentUser()
    const { sale, setSale, loading, error } = useSaleDetail(saleId)
    const [cancelling, setCancelling] = useState(false)

    function handleCancelled(updated: SaleDetail) {
        setSale(updated)
        setCancelling(false)
        toast.success('Venta anulada')
        onChanged()
    }

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
                                    {new Date(sale.created_at).toLocaleString('es-AR')}
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

                            <div className="space-y-1 ml-auto max-w-xs">
                                <Row label="Subtotal" value={formatMoney(sale.subtotal)} />
                                {sale.descuento_aplicado > 0 && (
                                    <Row label="Descuento" value={`-${formatMoney(sale.descuento_aplicado)}`} tone="text-green-600 dark:text-green-400" />
                                )}
                                {sale.recargo_aplicado > 0 && (
                                    <Row label="Recargo" value={`+${formatMoney(sale.recargo_aplicado)}`} />
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

                {isAdmin && sale?.estado === 'completada' && (
                    <div className="p-4 border-t border-border flex justify-end">
                        <button
                            onClick={() => setCancelling(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-destructive bg-destructive/10 hover:bg-destructive/20 font-medium transition-colors"
                        >
                            <Ban size={16} />
                            Anular venta
                        </button>
                    </div>
                )}
            </Modal>

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
