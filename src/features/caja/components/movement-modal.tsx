'use client'

import { useId, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Modal } from '@/components/ui/modal'
import { getErrorMessage } from '@/lib/errors'
import { parseMoneyInput } from '@/lib/money'
import { createCashMovement } from '../api'
import type { CashMovementType } from '../types'

type MovementModalProps = {
    initialType: CashMovementType
    onClose: () => void
    onSuccess: () => void
}

/** Registers a manual cash movement (ingreso / egreso) in the open session. */
export function MovementModal({ initialType, onClose, onSuccess }: MovementModalProps) {
    const titleId = useId()
    const [type, setType] = useState<CashMovementType>(initialType)
    const [amount, setAmount] = useState('')
    const [desc, setDesc] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        const parsed = parseMoneyInput(amount)
        if (parsed === null || parsed <= 0) {
            toast.error('Ingresa un monto válido mayor a 0.')
            return
        }
        setLoading(true)
        try {
            await createCashMovement({
                tipo: type,
                monto: parsed,
                motivo: desc
            })
            onSuccess()
            onClose()
        } catch (err: unknown) {
            toast.error(getErrorMessage(err, 'Error al registrar movimiento'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal
            onClose={onClose}
            labelledBy={titleId}
            backdrop="strong"
            className="bg-card w-full max-w-md p-6 rounded-2xl shadow-2xl border border-border"
        >
            <div className="flex justify-between items-center mb-6">
                <h3 id={titleId} className="text-xl font-bold text-foreground">Nuevo Movimiento</h3>
            </div>

            <div className="flex bg-muted rounded-xl p-1 mb-6">
                <button
                    type="button"
                    onClick={() => setType('ingreso')}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${type === 'ingreso' ? 'bg-background text-green-700 shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                    Ingreso
                </button>
                <button
                    type="button"
                    onClick={() => setType('egreso')}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${type === 'egreso' ? 'bg-background text-red-600 shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                    Egreso
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Monto</label>
                    <input
                        type="text"
                        inputMode="decimal"
                        required
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground font-bold text-lg focus:ring-2 focus:ring-brand focus:border-transparent"
                        placeholder="0,00"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Motivo</label>
                    <input
                        type="text"
                        required
                        value={desc}
                        onChange={(e) => setDesc(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-brand focus:border-transparent"
                        placeholder="Ej: Pago de limpieza..."
                    />
                </div>

                <div className="flex gap-3 pt-4">
                    <button type="button" onClick={onClose} className="flex-1 py-3 text-muted-foreground hover:text-foreground font-medium">Cancelar</button>
                    <button
                        type="submit"
                        disabled={loading || !amount}
                        className={`flex-1 py-3 rounded-xl text-white font-bold transition-all shadow-lg items-center justify-center flex gap-2 ${type === 'ingreso' ? 'bg-green-600 hover:bg-green-700 shadow-green-600/20' : 'bg-red-600 hover:bg-red-700 shadow-red-600/20'}`}
                    >
                        {loading && <Loader2 className="animate-spin w-5 h-5" />}
                        Guardar
                    </button>
                </div>
            </form>
        </Modal>
    )
}
