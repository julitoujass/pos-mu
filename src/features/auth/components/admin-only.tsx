'use client'

import React from 'react'
import { ShieldAlert } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useCurrentUser } from '../current-user'

/**
 * Renders children only for admins. Non-admins see an empty state (no redirect).
 * The backend still enforces the role; this only avoids showing a broken page.
 */
export function AdminOnly({ children }: { children: React.ReactNode }) {
    const { isAdmin, loading } = useCurrentUser()

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
        )
    }

    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center text-center gap-3 py-24 text-muted-foreground">
                <ShieldAlert size={48} className="text-brand" />
                <h2 className="text-xl font-bold text-foreground">No tenés permisos para ver esta sección</h2>
                <p className="text-sm">Pedile acceso a un administrador si lo necesitás.</p>
            </div>
        )
    }

    return <>{children}</>
}
