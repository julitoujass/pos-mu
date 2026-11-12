export type DatePreset = { label: string; start: string; end: string }

const today = new Date()

function isoDate(d: Date) {
    return d.toISOString().split('T')[0]
}

function addDays(d: Date, n: number) {
    const r = new Date(d)
    r.setDate(r.getDate() + n)
    return r
}

export const PRESETS: DatePreset[] = [
    { label: 'Hoy', start: isoDate(today), end: isoDate(today) },
    { label: '7 días', start: isoDate(addDays(today, -6)), end: isoDate(today) },
    { label: '30 días', start: isoDate(addDays(today, -29)), end: isoDate(today) },
    { label: 'Este mes', start: isoDate(new Date(today.getFullYear(), today.getMonth(), 1)), end: isoDate(today) },
]

/** Index of the preset selected by default ("7 días"). */
export const DEFAULT_PRESET = 1
