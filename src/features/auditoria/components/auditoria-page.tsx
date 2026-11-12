'use client'

import { formatDateTime } from '@/lib/dates'
import { useState } from 'react'
import { Eye, ScrollText } from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/ui/error-state'
import { Pagination } from '@/components/ui/pagination'
import { Refreshable } from '@/components/ui/refreshable'
import { TableSkeleton } from '@/components/ui/table-skeleton'
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

            {audit.error && <ErrorState message={audit.error} onRetry={audit.reload} />}

            {audit.loading ? (
                <TableSkeleton columns={7} />
            ) : audit.entries.length === 0 ? (
                !audit.error && (
                    <Refreshable refreshing={audit.refreshing}>
                        <EmptyState icon={ScrollText} message="No hay registros para los filtros seleccionados" />
                    </Refreshable>
                )
            ) : (
                <>
                    <Refreshable refreshing={audit.refreshing}>
                        <AuditTable entries={audit.entries} onViewDetail={setSelected} />
                    </Refreshable>
                    <Pagination
                        page={audit.page}
                        pageCount={audit.pageCount}
                        onPageChange={audit.setPage}
                        summary={`${from}-${to} de ${audit.total}`}
                        disabled={audit.refreshing}
                    />
                </>
            )}

            {selected && <AuditDetailModal entry={selected} onClose={() => setSelected(null)} />}
        </div>
    )
}

function AuditTable({ entries, onViewDetail }: { entries: AuditEntry[]; onViewDetail: (entry: AuditEntry) => void }) {
    return (
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
                    {entries.map(entry => (
                        <tr key={entry.id} className="hover:bg-muted/50 transition-colors">
                            <td className="p-4 whitespace-nowrap text-foreground">{formatDateTime(entry.created_at)}</td>
                            <td className="p-4 font-medium text-foreground">{entry.evento}</td>
                            <td className="p-4 text-muted-foreground">{entry.entidad}</td>
                            <td className="p-4 text-muted-foreground max-w-xs truncate">{entry.descripcion ?? '-'}</td>
                            <td className="p-4 text-muted-foreground">{entry.usuario?.nombre ?? '-'}</td>
                            <td className="p-4 text-muted-foreground">{entry.estado}</td>
                            <td className="p-4 text-right">
                                <button
                                    onClick={() => onViewDetail(entry)}
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
    )
}
