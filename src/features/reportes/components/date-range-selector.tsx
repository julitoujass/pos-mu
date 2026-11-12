import { Calendar } from 'lucide-react'
import { PRESETS } from '../date-presets'

type DateRangeSelectorProps = {
    /** Index of the active preset. */
    preset: number
    customRange: boolean
    fechaInicio: string
    fechaFin: string
    onSelectPreset: (index: number) => void
    onSelectCustom: () => void
    onFechaInicioChange: (value: string) => void
    onFechaFinChange: (value: string) => void
}

const ACTIVE_CLASS = 'bg-brand text-white shadow-md shadow-brand/20'
const INACTIVE_CLASS = 'bg-muted text-muted-foreground hover:text-foreground'
const DATE_INPUT_CLASS = 'px-3 py-1.5 rounded-lg border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-brand'

export function DateRangeSelector({
    preset,
    customRange,
    fechaInicio,
    fechaFin,
    onSelectPreset,
    onSelectCustom,
    onFechaInicioChange,
    onFechaFinChange,
}: DateRangeSelectorProps) {
    return (
        <div className="bg-card border border-border rounded-2xl p-4 flex flex-wrap items-center gap-3">
            <Calendar size={18} className="text-muted-foreground shrink-0" />
            <div className="flex flex-wrap gap-2">
                {PRESETS.map((p, i) => (
                    <button
                        key={p.label}
                        onClick={() => onSelectPreset(i)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${!customRange && preset === i ? ACTIVE_CLASS : INACTIVE_CLASS}`}
                    >
                        {p.label}
                    </button>
                ))}
                <button
                    onClick={onSelectCustom}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${customRange ? ACTIVE_CLASS : INACTIVE_CLASS}`}
                >
                    Personalizado
                </button>
            </div>

            {customRange && (
                <div className="flex items-center gap-2 ml-auto">
                    <input type="date" value={fechaInicio}
                        onChange={e => onFechaInicioChange(e.target.value)}
                        className={DATE_INPUT_CLASS}
                    />
                    <span className="text-muted-foreground text-sm">→</span>
                    <input type="date" value={fechaFin}
                        onChange={e => onFechaFinChange(e.target.value)}
                        className={DATE_INPUT_CLASS}
                    />
                </div>
            )}
        </div>
    )
}
