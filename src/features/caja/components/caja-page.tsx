'use client'

import { useState } from 'react'
import { CalendarDays, Lock, Unlock } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useCurrentUser } from '@/features/auth'
import { useCashSession } from '../hooks/use-cash-session'
import { CashSummaryCards } from './cash-summary-cards'
import { CloseRegisterForm } from './close-register-form'
import { MovementsTable } from './movements-table'
import { OpenRegisterForm } from './open-register-form'
import { SessionsHistoryModal } from './sessions-history-modal'
import { ShiftSalesSummary } from './shift-sales-summary'

export function CajaPage() {
    const { isAdmin } = useCurrentUser()
    const { cashStatus, movements, summary, loading, refresh } = useCashSession()
    const [showSessionsModal, setShowSessionsModal] = useState(false)

    if (loading && !cashStatus) {
        return <CajaSkeleton />
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Caja</h1>
                    <p className="text-muted-foreground">Gestión de turnos y movimientos</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {isAdmin && (
                        <button
                            onClick={() => setShowSessionsModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-full text-sm font-medium hover:bg-muted/80 transition-colors"
                        >
                            <CalendarDays size={16} />
                            Sesiones Anteriores
                        </button>
                    )}
                    {cashStatus?.estado === 'abierta' && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
                            <Unlock size={16} />
                            Caja Abierta
                        </div>
                    )}
                    {cashStatus?.estado === 'cerrada' && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-sm font-medium">
                            <Lock size={16} />
                            Caja Cerrada
                        </div>
                    )}
                </div>
            </div>

            {!cashStatus || cashStatus.estado === 'cerrada' ? (
                <OpenRegisterForm onSuccess={refresh} />
            ) : (
                <div className="space-y-6">
                    <CashSummaryCards status={cashStatus} summary={summary} onSuccess={refresh} />
                    <ShiftSalesSummary summary={summary} />
                    <MovementsTable movements={movements} />
                    <CloseRegisterForm summary={summary} onSuccess={refresh} />
                </div>
            )}

            {isAdmin && showSessionsModal && (
                <SessionsHistoryModal onClose={() => setShowSessionsModal(false)} />
            )}
        </div>
    )
}

function CajaSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-10 w-32 rounded-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Skeleton className="h-40 rounded-2xl" />
                <Skeleton className="h-40 rounded-2xl" />
                <Skeleton className="h-40 rounded-2xl" />
            </div>

            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-border bg-muted/30">
                    <Skeleton className="h-6 w-48" />
                </div>
                <div className="p-6 space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            </div>
        </div>
    )
}
