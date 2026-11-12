'use client'

import { useId } from 'react'
import { History, Loader2, X } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { useSessionsHistory } from '../hooks/use-sessions-history'
import { MovementsDataTable } from './movements-table'
import { SessionList } from './session-list'

function Spinner() {
    return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-muted-foreground w-8 h-8" /></div>
}

function EmptyNotice({ children }: { children: React.ReactNode }) {
    return (
        <div className="text-center bg-muted/30 py-12 rounded-2xl border border-dashed border-border">
            <p className="text-muted-foreground">{children}</p>
        </div>
    )
}

/** Admin-only history: past sessions and, on selection, their movements. */
export function SessionsHistoryModal({ onClose }: { onClose: () => void }) {
    const titleId = useId()
    const {
        sessions,
        loading,
        selectedSession,
        movements,
        loadingMovements,
        selectSession,
        clearSelection,
    } = useSessionsHistory()

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
                        <h3 id={titleId} className="text-xl font-bold text-foreground">
                            {selectedSession ? 'Movimientos de la Sesión' : 'Sesiones Anteriores'}
                        </h3>
                        {selectedSession && (
                            <p className="text-sm text-muted-foreground mt-0.5">
                                Apertura: {new Date(selectedSession.fecha_apertura).toLocaleString('es-AR')}
                            </p>
                        )}
                    </div>
                </div>
                <button onClick={onClose} className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors">
                    <X size={20} />
                </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
                {selectedSession ? (
                    <div className="space-y-4">
                        <button
                            onClick={clearSelection}
                            className="text-sm text-brand font-medium hover:underline mb-2 inline-flex items-center gap-1"
                        >
                            ← Volver a sesiones
                        </button>

                        {loadingMovements ? (
                            <Spinner />
                        ) : movements.length === 0 ? (
                            <EmptyNotice>No hay movimientos registrados en esta sesión.</EmptyNotice>
                        ) : (
                            <div className="overflow-x-auto border border-border rounded-xl">
                                <MovementsDataTable movements={movements} timeLocale="es-AR" />
                            </div>
                        )}
                    </div>
                ) : loading ? (
                    <Spinner />
                ) : sessions.length === 0 ? (
                    <EmptyNotice>No hay sesiones anteriores registradas.</EmptyNotice>
                ) : (
                    <SessionList sessions={sessions} onViewMovements={selectSession} />
                )}
            </div>
        </Modal>
    )
}
