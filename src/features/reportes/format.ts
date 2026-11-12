/** Reports show whole pesos (no decimals) to keep KPIs and charts compact. */
export function formatWholeMoney(n: number): string {
    return `$${n.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

/** Formats a `YYYY-MM-DD` date as `dd/mm` in local time. */
export function formatDayMonth(iso: string): string {
    return new Date(iso + 'T00:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })
}
