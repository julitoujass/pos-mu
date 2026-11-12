'use client'

import { Settings } from 'lucide-react'
import { FormError } from '@/components/ui/form-error'
import { Skeleton } from '@/components/ui/skeleton'
import { AdminOnly } from '@/features/auth'
import { useBusinessSettings } from '../hooks/use-business-settings'
import { SettingsForm } from './settings-form'

export function SettingsPage() {
    return (
        <AdminOnly>
            <SettingsContent />
        </AdminOnly>
    )
}

function SettingsContent() {
    const { settings, setSettings, loading, error } = useBusinessSettings()

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                    <Settings className="text-brand" />
                    Configuración
                </h1>
                <p className="text-muted-foreground mt-1">Datos del negocio y reglas de venta</p>
            </div>

            <FormError message={error} />
            {loading && <Skeleton className="h-96 w-full max-w-3xl rounded-2xl" />}
            {settings && (
                // Remount with the saved copy so the form always reflects the backend.
                <SettingsForm key={settings.updated_at ?? 'initial'} settings={settings} onSaved={setSettings} />
            )}
        </div>
    )
}
