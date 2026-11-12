import type { AuditFormFilters } from '../hooks/use-audit-log'

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

type AuditFiltersProps = {
    filters: AuditFormFilters
    onChange: (filters: AuditFormFilters) => void
}

export function AuditFilters({ filters, onChange }: AuditFiltersProps) {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-card p-4 rounded-2xl border border-border">
            <Field label="Desde">
                <input type="date" value={filters.desde} max={filters.hasta || undefined} onChange={e => onChange({ ...filters, desde: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Hasta">
                <input type="date" value={filters.hasta} min={filters.desde || undefined} onChange={e => onChange({ ...filters, hasta: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Evento">
                <input type="text" value={filters.evento} placeholder="Ej: venta.creada" onChange={e => onChange({ ...filters, evento: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Entidad">
                <input type="text" value={filters.entidad} placeholder="Ej: ventas" onChange={e => onChange({ ...filters, entidad: e.target.value })} className={inputClass} />
            </Field>
        </div>
    )
}
