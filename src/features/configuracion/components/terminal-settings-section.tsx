'use client'

import { useId, useState } from 'react'
import { Link2, Plug, Save, Unplug } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { FormError } from '@/components/ui/form-error'
import {
    disconnectClover,
    fetchCloverAuthorizeUrl,
    fetchTerminalStatus,
    updateTerminalSettings,
    type TerminalSettingsUpdate,
    type TerminalStatus,
} from '@/features/pagos'
import { getErrorMessage } from '@/lib/errors'

type TerminalSettingsSectionProps = {
    status: TerminalStatus
    /** Called after saving so the parent reloads the status. */
    onSaved: () => void
}

const inputClass =
    'w-full px-3 py-2.5 rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-brand focus:border-transparent transition-all'

/** Admin section: link the Clover account, enable the payment terminal and set its device / POS identifiers. */
export function TerminalSettingsSection({ status, onSaved }: TerminalSettingsSectionProps) {
    const deviceId = useId()
    const posId = useId()
    const isClover = status.proveedor === 'clover'
    const linked = status.conectado_oauth === true
    const [enabled, setEnabled] = useState(status.habilitado)
    const [device, setDevice] = useState(status.device_id ?? '')
    const [pos, setPos] = useState(status.pos_id ?? '')
    const [saving, setSaving] = useState(false)
    const [connecting, setConnecting] = useState(false)
    const [disconnecting, setDisconnecting] = useState(false)
    const [confirmDisconnect, setConfirmDisconnect] = useState(false)
    const [testing, setTesting] = useState(false)
    const [deviceReachable, setDeviceReachable] = useState<boolean | null>(null)
    const [error, setError] = useState<string | null>(null)

    const canEnable = !isClover || (linked && device.trim() !== '')
    const switchBlocked = !canEnable && !enabled

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

    async function handleConnect() {
        setConnecting(true)
        setError(null)
        try {
            const url = await fetchCloverAuthorizeUrl()
            window.location.assign(url)
        } catch (err: unknown) {
            setError(getErrorMessage(err, 'Error al conectar con Clover'))
            setConnecting(false)
        }
    }

    async function handleDisconnect() {
        setDisconnecting(true)
        try {
            await disconnectClover()
            toast.success('Clover desconectado')
            setConfirmDisconnect(false)
            onSaved()
        } catch (err: unknown) {
            toast.error(getErrorMessage(err, 'Error al desconectar Clover'))
        } finally {
            setDisconnecting(false)
        }
    }

    async function handleTest() {
        setTesting(true)
        setError(null)
        try {
            const fresh = await fetchTerminalStatus()
            setDeviceReachable(fresh.conectado)
        } catch (err: unknown) {
            setDeviceReachable(null)
            setError(getErrorMessage(err, 'Error al probar la conexión'))
        } finally {
            setTesting(false)
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
                    {!isClover && <p className="text-xs text-muted-foreground mt-1">Terminal simulado (desarrollo)</p>}
                </div>
                <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${status.conectado
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                        : 'bg-muted text-muted-foreground'}`}
                >
                    {status.conectado ? 'Conectado' : 'Desconectado'}
                </span>
            </div>

            {isClover && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-4">
                    <p className="text-sm text-foreground">
                        <span className="font-medium">Cuenta Clover: </span>
                        <span className={linked ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}>
                            {linked ? `Conectada${status.merchant_id ? ` (merchant ${status.merchant_id})` : ''}` : 'No conectada'}
                        </span>
                    </p>
                    {linked ? (
                        <Button
                            type="button"
                            variant="secondary"
                            icon={<Unplug size={18} />}
                            onClick={() => setConfirmDisconnect(true)}
                            className="px-4 py-2 font-medium"
                        >
                            Desconectar
                        </Button>
                    ) : (
                        <Button
                            type="button"
                            loading={connecting}
                            loadingLabel="Redirigiendo..."
                            icon={<Link2 size={18} />}
                            onClick={handleConnect}
                            className="px-4 py-2 font-medium"
                        >
                            Conectar Clover
                        </Button>
                    )}
                </div>
            )}

            <div>
                <label className={`flex items-center gap-3 ${switchBlocked ? 'opacity-60' : 'cursor-pointer'}`}>
                    <input
                        type="checkbox"
                        role="switch"
                        aria-checked={enabled}
                        checked={enabled}
                        disabled={switchBlocked}
                        onChange={e => setEnabled(e.target.checked)}
                        className="w-5 h-5 accent-brand"
                    />
                    <span className="text-sm font-medium text-foreground">Habilitado</span>
                </label>
                {switchBlocked && (
                    <p className="text-xs text-muted-foreground mt-1">
                        {linked
                            ? 'Completá la serie del dispositivo para poder habilitar el terminal.'
                            : 'Conectá la cuenta de Clover y completá la serie del dispositivo para poder habilitar el terminal.'}
                    </p>
                )}
            </div>

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

            <div className="flex flex-wrap items-center justify-end gap-3">
                {isClover && deviceReachable !== null && (
                    <span
                        role="status"
                        className={`text-sm font-medium ${deviceReachable ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}
                    >
                        {deviceReachable ? 'Dispositivo conectado' : 'Sin respuesta del dispositivo'}
                    </span>
                )}
                {isClover && (
                    <Button
                        type="button"
                        variant="secondary"
                        loading={testing}
                        loadingLabel="Probando..."
                        icon={<Plug size={18} />}
                        onClick={handleTest}
                        className="px-5 py-2.5 font-medium"
                    >
                        Probar conexión
                    </Button>
                )}
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

            {confirmDisconnect && (
                <ConfirmDialog
                    title="Desconectar Clover"
                    message="Se dejarán de aceptar cobros con tarjeta y QR hasta que vuelvas a conectar la cuenta."
                    confirmLabel="Desconectar"
                    destructive
                    loading={disconnecting}
                    onConfirm={handleDisconnect}
                    onCancel={() => setConfirmDisconnect(false)}
                />
            )}
        </form>
    )
}
