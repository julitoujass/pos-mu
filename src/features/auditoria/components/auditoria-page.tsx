'use client'

import { useState } from 'react'
import { AlertCircle, ChevronLeft, ChevronRight, Eye, ScrollText } from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { AdminOnly } from '@/features/auth'
import { AUDIT_PAGE_SIZE, useAuditLog } from '../hooks/use-audit-log'
import type { AuditEntry } from '../types'
import { AuditDetailModal } from './audit-detail-modal'
import { AuditFilters } from './audit-filters'

export function AuditoriaPage() {
    return (
        <AdminOnly>
            <AuditoriaContent />
        </AdminOnly>
    )
}

function AuditoriaContent() {
    const audit = useAuditLog()
    const [selected, setSelected] = useState<AuditEntry | null>(null)

    const from = audit.total === 0 ? 0 : audit.page * AUDIT_PAGE_SIZE + 1
    const to = Math.min(audit.total, (audit.page + 1) * AUDIT_PAGE_SIZE)

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                    <ScrollText className="text-brand" />
                    Auditoría
                </h1>
                <p className="text-muted-foreground mt-1">Registro de acciones realizadas en el sistema</p>
            </div>

            <AuditFilters filters={audit.filters} onChange={audit.setFilters} />

            {audit.error && (
                <div className="p-4 bg-destructive/10 text-destructive rounded-xl flex items-center gap-3">
                    <AlertCircle size={20} />
                    {audit.error}
                </div>
            )}

            {audit.loading ? (
                <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
                    {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
            ) : audit.entries.length === 0 ? (
                <EmptyState icon={ScrollText} message="No hay registros para los filtros seleccionados" />
            ) : (
                <>
                    <div className="bg-card rounded-2xl border border-border overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted text-muted-foreground font-bold text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="p-4">Fecha</th>
                                    <th className="p-4">Evento</th>
                                    <th className="p-4">Entidad</th>
                                    <th className="p-4">Descripción</th>
                                    <th className="p-4">Usuario</th>
                                    <th className="p-4">Estado</th>
                                    <th className="p-4"><span className="sr-only">Acciones</span></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {audit.entries.map(entry => (
                                    <tr key={entry.id} className="hover:bg-muted/50">
                                        <td className="p-4 whitespace-nowrap text-foreground">{new Date(entry.created_at).toLocaleString('es-AR')}</td>
                                        <td className="p-4 font-medium text-foreground">{entry.evento}</td>
                                        <td className="p-4 text-muted-foreground">{entry.entidad}</td>
                                        <td className="p-4 text-muted-foreground max-w-xs truncate">{entry.descripcion ?? '-'}</td>
                                        <td className="p-4 text-muted-foreground">{entry.usuario?.nombre ?? '-'}</td>
                                        <td className="p-4 text-muted-foreground">{entry.estado}</td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => setSelected(entry)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-brand bg-brand/10 hover:bg-brand/20 transition-colors"
                                            >
                                                <Eye size={14} />
                                                Ver detalle
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{from}-{to} de {audit.total}</span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => audit.setPage(audit.page - 1)}
                                disabled={audit.page === 0}
                                aria-label="Página anterior"
                                className="p-2 rounded-lg border border-input bg-card hover:bg-muted disabled:opacity-50 transition-colors"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span>Página {audit.page + 1} de {audit.pageCount}</span>
                            <button
                                onClick={() => audit.setPage(audit.page + 1)}
                                disabled={audit.page + 1 >= audit.pageCount}
                                aria-label="Página siguiente"
                                className="p-2 rounded-lg border border-input bg-card hover:bg-muted disabled:opacity-50 transition-colors"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </>
            )}

            {selected && <AuditDetailModal entry={selected} onClose={() => setSelected(null)} />}
        </div>
    )
}
