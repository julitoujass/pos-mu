'use client'

import { useId, useState } from 'react'
import { Save } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { FormError } from '@/components/ui/form-error'
import { updateTerminalSettings, type TerminalSettingsUpdate, type TerminalStatus } from '@/features/pagos'
import { getErrorMessage } from '@/lib/errors'

type TerminalSettingsSectionProps = {
    status: TerminalStatus
    /** Called after saving so the parent reloads the status. */
    onSaved: () => void
}

const inputClass =
    'w-full px-3 py-2.5 rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-brand focus:border-transparent transition-all'

/** Admin section: enable the payment terminal and set its device / POS identifiers. */
export function TerminalSettingsSection({ status, onSaved }: TerminalSettingsSectionProps) {
    const deviceId = useId()
    const posId = useId()
    const [enabled, setEnabled] = useState(status.habilitado)
    const [device, setDevice] = useState(status.device_id ?? '')
    const [pos, setPos] = useState(status.pos_id ?? '')
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleSave(e: React.FormEvent) {
        e.preventDefault()
        setSaving(true)
        setError(null)
        const data: TerminalSettingsUpdate = { habilitado: enabled }
        if (device.trim()) data.device_id = device.trim()
        if (pos.trim()) data.pos_id = pos.trim()
        try {
            await updateTerminalSettings(data)
            toast.success('Terminal de pago guardado')
            onSaved()
        } catch (err: unknown) {
            setError(getErrorMessage(err, 'Error al guardar el terminal de pago'))
        } finally {
            setSaving(false)
        }
    }

    return (
        <form onSubmit={handleSave} className="bg-card rounded-2xl border border-border p-6 space-y-4 max-w-3xl">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-lg font-bold text-foreground">Terminal de pago</h2>
                    <p className="text-sm text-muted-foreground">
                        Cobros con tarjeta y QR a través del terminal. Proveedor:{' '}
                        <span className="font-medium text-foreground">{status.proveedor}</span>
                    </p>
                </div>
                <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${status.conectado
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                        : 'bg-muted text-muted-foreground'}`}
                >
                    {status.conectado ? 'Conectado' : 'Desconectado'}
                </span>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
                <input
                    type="checkbox"
                    role="switch"
                    aria-checked={enabled}
                    checked={enabled}
                    onChange={e => setEnabled(e.target.checked)}
                    className="w-5 h-5 accent-brand"
                />
                <span className="text-sm font-medium text-foreground">Habilitado</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor={deviceId} className="block text-sm font-medium text-foreground mb-1">Serie del dispositivo</label>
                    <input id={deviceId} className={inputClass} value={device} onChange={e => setDevice(e.target.value)} />
                </div>
                <div>
                    <label htmlFor={posId} className="block text-sm font-medium text-foreground mb-1">ID de POS</label>
                    <input id={posId} className={inputClass} value={pos} onChange={e => setPos(e.target.value)} />
                </div>
            </div>
            <p className="text-xs text-muted-foreground">Los identificadores vacíos no se modifican.</p>

            <FormError message={error} />

            <div className="flex justify-end">
                <Button
                    type="submit"
                    loading={saving}
                    loadingLabel="Guardando..."
                    icon={<Save size={18} />}
                    className="px-5 py-2.5 font-medium"
                >
                    Guardar terminal
                </Button>
            </div>
        </form>
    )
}
