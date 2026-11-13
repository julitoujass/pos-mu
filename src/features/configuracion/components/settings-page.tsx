'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Settings } from 'lucide-react'
import { toast } from 'sonner'
import { ErrorState } from '@/components/ui/error-state'
import { Skeleton } from '@/components/ui/skeleton'
import { AdminOnly } from '@/features/auth'
import { useTerminalStatus } from '@/features/pagos'
import { cloverCallbackMessage } from '../clover-callback'
import { useBusinessSettings } from '../hooks/use-business-settings'
import { SettingsForm } from './settings-form'
import { TerminalSettingsSection } from './terminal-settings-section'

export function SettingsPage() {
    return (
        <AdminOnly>
            <SettingsContent />
        </AdminOnly>
    )
}

function SettingsContent() {
    const { settings, setSettings, loading, error, reload } = useBusinessSettings()
    const terminal = useTerminalStatus()
    const router = useRouter()
    const { reload: reloadTerminal } = terminal

    // Read the Clover callback result once, then clean the URL.
    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const result = cloverCallbackMessage(params)
        if (!result) return
        if (result.type === 'success') toast.success(result.message)
        else toast.error(result.message)
        router.replace('/dashboard/settings')
        reloadTerminal()
        // eslint-disable-next-line react-hooks/exhaustive-deps -- one-shot on mount
    }, [])

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                    <Settings className="text-brand" />
                    Configuración
                </h1>
                <p className="text-muted-foreground mt-1">Datos del negocio y reglas de venta</p>
            </div>

            {error && <ErrorState message={error} onRetry={reload} className="max-w-3xl" />}
            {loading && <SettingsFormSkeleton />}
            {settings && (
                // Remount with the saved copy so the form always reflects the backend.
                <SettingsForm key={settings.updated_at ?? 'initial'} settings={settings} onSaved={setSettings} />
            )}
            {terminal.status && (
                <TerminalSettingsSection key={JSON.stringify(terminal.status)} status={terminal.status} onSaved={terminal.reload} />
            )}
        </div>
    )
}

/** Mirrors the form card: two-column fields and the save button. */
function SettingsFormSkeleton() {
    return (
        <div className="bg-card rounded-2xl border border-border p-6 space-y-6 max-w-3xl" aria-hidden="true">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-11 w-full rounded-xl" />
                    </div>
                ))}
            </div>
            <Skeleton className="h-24 w-full rounded-xl" />
            <div className="flex justify-end">
                <Skeleton className="h-11 w-32 rounded-xl" />
            </div>
        </div>
    )
}
