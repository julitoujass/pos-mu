import { PAYMENT_METHODS, type PaymentMethod, type SaleStatus } from '../types'
import type { HistoryFilters } from '../hooks/use-sales-history'

type SalesHistoryFiltersProps = {
    filters: HistoryFilters
    onChange: (filters: HistoryFilters) => void
}

const inputClass =
    'w-full px-3 py-2 rounded-xl border border-input bg-card text-foreground text-sm focus:ring-2 focus:ring-brand focus:border-transparent'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <label className="block">
            <span className="block text-xs uppercase font-bold text-muted-foreground tracking-wider mb-1">{label}</span>
            {children}
        </label>
    )
}

export function SalesHistoryFilters({ filters, onChange }: SalesHistoryFiltersProps) {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-card p-4 rounded-2xl border border-border">
            <Field label="Desde">
                <input
                    type="date"
                    value={filters.desde}
                    max={filters.hasta || undefined}
                    onChange={e => onChange({ ...filters, desde: e.target.value })}
                    className={inputClass}
                />
            </Field>
            <Field label="Hasta">
                <input
                    type="date"
                    value={filters.hasta}
                    min={filters.desde || undefined}
                    onChange={e => onChange({ ...filters, hasta: e.target.value })}
                    className={inputClass}
                />
            </Field>
            <Field label="Método de pago">
                <select
                    value={filters.metodo_pago}
                    onChange={e => onChange({ ...filters, metodo_pago: e.target.value as PaymentMethod | '' })}
                    className={inputClass}
                >
                    <option value="">Todos</option>
                    {PAYMENT_METHODS.map(method => (
                        <option key={method} value={method}>{method}</option>
                    ))}
                </select>
            </Field>
            <Field label="Estado">
                <select
                    value={filters.estado}
                    onChange={e => onChange({ ...filters, estado: e.target.value as SaleStatus | '' })}
                    className={inputClass}
                >
                    <option value="">Todas</option>
                    <option value="completada">Completadas</option>
                    <option value="anulada">Anuladas</option>
                </select>
            </Field>
        </div>
    )
}
