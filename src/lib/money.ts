/** Rounds to 2 decimals avoiding binary float drift (e.g. 1.005 -> 1.01). */
export function roundMoney(n: number): number {
    return Math.round((n + Number.EPSILON) * 100) / 100
}

/** Formats an amount as es-AR currency, e.g. `$1.234,50`. */
export function formatMoney(n: number): string {
    const abs = Math.abs(roundMoney(n)).toLocaleString('es-AR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })
    return `${n < 0 ? '-' : ''}$${abs}`
}

/**
 * Parses user-typed amounts such as "1234.5", "1234,5" or "1.234,50".
 * Returns null when the input is empty, malformed or negative.
 */
export function parseMoneyInput(input: string): number | null {
    const s = input.trim()
    if (!s) return null

    let normalized: string
    if (s.includes(',')) {
        // Comma is the decimal separator; dots are thousands separators.
        if (s.split(',').length > 2) return null
        normalized = s.replace(/\./g, '').replace(',', '.')
    } else if ((s.match(/\./g) ?? []).length > 1 || /^\d{1,3}\.\d{3}$/.test(s)) {
        // Several dots, or one dot followed by exactly 3 digits ("15.000"),
        // are es-AR thousands separators.
        normalized = s.replace(/\./g, '')
    } else {
        normalized = s
    }

    if (!/^\d+(\.\d+)?$/.test(normalized)) return null
    const value = Number(normalized)
    return Number.isFinite(value) ? roundMoney(value) : null
}
