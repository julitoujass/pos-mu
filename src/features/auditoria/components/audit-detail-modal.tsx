'use client'

import { formatDateTime } from '@/lib/dates'
import { useId } from 'react'
import { X } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import type { AuditEntry } from '../types'

function JsonBlock({ title, value }: { title: string; value: unknown }) {
    return (
        <div>
            <h4 className="text-xs uppercase font-bold text-muted-foreground tracking-wider mb-1">{title}</h4>
            <pre className="p-3 rounded-xl bg-muted text-xs text-foreground overflow-x-auto max-h-64">
                {value === null || value === undefined ? 'Sin datos' : JSON.stringify(value, null, 2)}
            </pre>
        </div>
    )
}

/** Pretty-printed payload and response of an audit entry. */
export function AuditDetailModal({ entry, onClose }: { entry: AuditEntry; onClose: () => void }) {
    const titleId = useId()
    return (
        <Modal
            onClose={onClose}
            labelledBy={titleId}
            backdrop="strong"
            className="bg-card w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border border-border p-6 space-y-4"
        >
            <div className="flex justify-between items-start gap-3">
                <div>
                    <h3 id={titleId} className="text-xl font-bold text-foreground">{entry.evento}</h3>
                    <p className="text-sm text-muted-foreground">
                        {formatDateTime(entry.created_at)}
                        {entry.usuario && ` · ${entry.usuario.nombre}`}
                    </p>
                    {entry.descripcion && <p className="text-sm text-foreground mt-1">{entry.descripcion}</p>}
                </div>
                <button onClick={onClose} aria-label="Cerrar" className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors">
                    <X size={20} />
                </button>
            </div>
            <JsonBlock title="Datos enviados" value={entry.payload_enviado} />
            <JsonBlock title="Respuesta recibida" value={entry.respuesta_recibida} />
        </Modal>
    )
}
