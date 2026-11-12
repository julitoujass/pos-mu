'use client'

import { useId } from 'react'
import { ChevronLeft, ChevronRight, History, Loader2, X } from 'lucide-react'
import { FormError } from '@/components/ui/form-error'
import { Modal } from '@/components/ui/modal'
import { useVariantMovements } from '../hooks/use-variant-movements'
import type { StockMovementType, Variant } from '../types'

const TYPE_BADGE: Record<StockMovementType, { label: string; className: string }> = {
    venta: { label: 'Venta', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
    anulacion: { label: 'Anulación', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
    ajuste: { label: 'Ajuste', className: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300' },
}

type StockMovementsModalProps = {
    variant: Variant
    onClose: () => void
}

/** Admin-only kardex: every stock movement of a variant, newest first. */
export function StockMovementsModal({ variant, onClose }: StockMovementsModalProps) {
    const titleId = useId()
    const { movements, loading, error, page, setPage, pageCount, total } = useVariantMovements(variant.id)

    return (
        <Modal
            onClose={onClose}
            labelledBy={titleId}
            backdrop="strong"
            className="bg-card w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col rounded-2xl shadow-2xl border border-border"
        >
            <div className="flex justify-between items-center p-6 border-b border-border">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand/10 text-brand rounded-full flex items-center justify-center">
                        <History size={20} />
                    </div>
                    <div>
                        <h3 id={titleId} className="text-xl font-bold text-foreground">Movimientos de stock</h3>
                        <p className="text-sm text-muted-foreground">
                            SKU: {variant.sku || 'N/A'} · Stock actual: {variant.stock_actual}
                        </p>
                    </div>
                </div>
                <button onClick={onClose} aria-label="Cerrar" className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors">
                    <X size={20} />
                </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
                <FormError message={error} />

                {loading ? (
                    <div className="flex justify-center p-12">
                        <Loader2 className="animate-spin text-muted-foreground w-8 h-8" />
                    </div>
                ) : movements.length === 0 && !error ? (
                    <div className="text-center bg-muted/30 py-12 rounded-2xl border border-dashed border-border">
                        <p className="text-muted-foreground">Esta variante todavía no tiene movimientos de stock.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto border border-border rounded-xl">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted text-muted-foreground text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="p-3">Fecha</th>
                                    <th className="p-3">Tipo</th>
                                    <th className="p-3 text-right">Cantidad</th>
                                    <th className="p-3 text-right">Stock resultante</th>
                                    <th className="p-3">Usuario</th>
                                    <th className="p-3">Motivo</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {movements.map(movement => {
                                    const badge = TYPE_BADGE[movement.tipo]
                                    const incoming = movement.cantidad > 0
                                    return (
                                        <tr key={movement.id}>
                                            <td className="p-3 whitespace-nowrap text-foreground">
                                                {new Date(movement.created_at).toLocaleString('es-AR')}
                                            </td>
                                            <td className="p-3">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge.className}`}>
                                                    {badge.label}
                                                </span>
                                            </td>
                                            <td className={`p-3 text-right font-mono font-medium ${incoming ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}`}>
                                                {incoming ? '+' : ''}{movement.cantidad}
                                            </td>
                                            <td className="p-3 text-right text-foreground">{movement.stock_resultante}</td>
                                            <td className="p-3 text-muted-foreground">{movement.usuario?.nombre ?? '-'}</td>
                                            <td className="p-3 text-muted-foreground">
                                                {movement.motivo || '-'}
                                                {movement.venta_id && (
                                                    <span className="block text-xs font-mono">
                                                        Venta #{movement.venta_id.slice(0, 8)}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {total > 0 && (
                <div className="p-4 border-t border-border flex items-center justify-between text-sm text-muted-foreground">
                    <span>{total} movimiento{total !== 1 ? 's' : ''}</span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(page - 1)}
                            disabled={page === 0 || loading}
                            aria-label="Página anterior"
                            className="p-2 rounded-lg border border-input bg-card hover:bg-muted disabled:opacity-50 transition-colors"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <span>Página {page + 1} de {pageCount}</span>
                        <button
                            onClick={() => setPage(page + 1)}
                            disabled={page + 1 >= pageCount || loading}
                            aria-label="Página siguiente"
                            className="p-2 rounded-lg border border-input bg-card hover:bg-muted disabled:opacity-50 transition-colors"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </Modal>
    )
}
