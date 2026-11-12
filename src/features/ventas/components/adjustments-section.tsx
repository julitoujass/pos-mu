import { formatMoney } from '@/lib/money'
import { EMPLOYEE_MAX_DISCOUNT_PERCENT, type SaleTotals } from '../pricing'
import type { AdjustmentType } from '../types'

export type AdjustmentsState = {
    isAdmin: boolean
    discountType: AdjustmentType
    discountInput: string
    discountError: string | null
    discountOverLimit: boolean
    surchargeType: AdjustmentType
    surchargeInput: string
    surchargeError: string | null
    setDiscountType: (type: AdjustmentType) => void
    setDiscountInput: (value: string) => void
    setSurchargeType: (type: AdjustmentType) => void
    setSurchargeInput: (value: string) => void
}

type AdjustmentFieldProps = {
    label: string
    hint?: string
    type: AdjustmentType
    value: string
    error: string | null
    onTypeChange: (type: AdjustmentType) => void
    onValueChange: (value: string) => void
}

function AdjustmentField({ label, hint, type, value, error, onTypeChange, onValueChange }: AdjustmentFieldProps) {
    return (
        <div>
            <div className="flex items-center justify-between mb-1">
                <label className="text-xs uppercase font-bold text-muted-foreground tracking-wider">{label}</label>
                {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
            </div>
            <div className="flex gap-2">
                <div className="flex bg-muted p-0.5 rounded-lg" role="group" aria-label={`Tipo de ${label.toLowerCase()}`}>
                    {(['porcentaje', 'monto'] as const).map(option => (
                        <button
                            key={option}
                            type="button"
                            onClick={() => onTypeChange(option)}
                            aria-pressed={type === option}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${type === option
                                ? 'bg-card text-brand shadow-sm border border-border'
                                : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            {option === 'porcentaje' ? '%' : '$'}
                        </button>
                    ))}
                </div>
                <input
                    type="text"
                    inputMode="decimal"
                    value={value}
                    onChange={e => onValueChange(e.target.value)}
                    placeholder="0"
                    aria-label={label}
                    aria-invalid={error ? true : undefined}
                    className="flex-1 min-w-0 px-3 py-1.5 rounded-lg border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-brand focus:border-transparent"
                />
            </div>
            {error && <p className="text-xs text-destructive mt-1">{error}</p>}
        </div>
    )
}

function Row({ label, value, tone }: { label: string; value: string; tone?: string }) {
    return (
        <div className={`flex justify-between text-sm ${tone ?? 'text-muted-foreground'}`}>
            <span>{label}</span>
            <span className="font-medium">{value}</span>
        </div>
    )
}

type AdjustmentsSectionProps = {
    state: AdjustmentsState
    totals: SaleTotals
}

/** Optional discount and surcharge controls with the subtotal breakdown. */
export function AdjustmentsSection({ state, totals }: AdjustmentsSectionProps) {
    const discountError = state.discountError
        ?? (state.discountOverLimit
            ? `El descuento máximo permitido es ${EMPLOYEE_MAX_DISCOUNT_PERCENT}%`
            : null)

    return (
        <div className="space-y-3">
            <AdjustmentField
                label="Descuento"
                hint={state.isAdmin ? undefined : `máx. ${EMPLOYEE_MAX_DISCOUNT_PERCENT}%`}
                type={state.discountType}
                value={state.discountInput}
                error={discountError}
                onTypeChange={state.setDiscountType}
                onValueChange={state.setDiscountInput}
            />
            <AdjustmentField
                label="Recargo"
                type={state.surchargeType}
                value={state.surchargeInput}
                error={state.surchargeError}
                onTypeChange={state.setSurchargeType}
                onValueChange={state.setSurchargeInput}
            />
            <div className="space-y-1 pt-1">
                <Row label="Subtotal" value={formatMoney(totals.subtotal)} />
                {totals.descuento > 0 && (
                    <Row label="Descuento" value={`-${formatMoney(totals.descuento)}`} tone="text-green-600 dark:text-green-400" />
                )}
                {totals.recargo > 0 && <Row label="Recargo" value={`+${formatMoney(totals.recargo)}`} />}
            </div>
        </div>
    )
}
