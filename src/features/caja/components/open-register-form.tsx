'use client'

import { useState } from 'react'
import { AlertCircle, DollarSign, Unlock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getErrorMessage } from '@/lib/errors'
import { parseMoneyInput } from '@/lib/money'
import { openRegister } from '../api'

export function OpenRegisterForm({ onSuccess }: { onSuccess: () => void }) {
    const [amount, setAmount] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        const parsed = parseMoneyInput(amount)
        if (parsed === null) {
            setError('Ingresa un monto inicial válido (0 o mayor).')
            return
        }
        setLoading(true)
        setError(null)
        try {
            await openRegister({ monto_apertura: parsed })
            onSuccess()
        } catch (err: unknown) {
            setError(getErrorMessage(err, 'Error al abrir caja'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-card border border-border rounded-2xl p-8 max-w-md mx-auto shadow-lg text-center">
            <div className="w-16 h-16 bg-brand/10 text-brand rounded-full flex items-center justify-center mx-auto mb-6">
                <Unlock size={32} />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Apertura de Caja</h2>
            <p className="text-muted-foreground mb-6">Ingresa el monto inicial para comenzar el turno.</p>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
                <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Monto Inicial</label>
                    <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                        <input
                            type="text"
                            inputMode="decimal"
                            required
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-background text-foreground text-lg font-bold focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                            placeholder="0,00"
                        />
                    </div>
                </div>

                {error && (
                    <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm flex items-center gap-2">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                <Button
                    type="submit"
                    loading={loading}
                    loadingLabel="Abriendo caja..."
                    disabled={!amount}
                    className="w-full py-3 font-bold shadow-lg shadow-brand/20"
                >
                    Abrir Caja
                </Button>
            </form>
        </div>
    )
}
