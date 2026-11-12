const LOCALE = 'es-AR'
const TIME_ZONE = 'America/Argentina/Buenos_Aires'

const dateTimeFormat = new Intl.DateTimeFormat(LOCALE, {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: TIME_ZONE,
})
const timeFormat = new Intl.DateTimeFormat(LOCALE, {
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: TIME_ZONE,
})
const dateFormat = new Intl.DateTimeFormat(LOCALE, {
    day: '2-digit', month: '2-digit', year: 'numeric', timeZone: TIME_ZONE,
})
const longDateFormat = new Intl.DateTimeFormat(LOCALE, {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: TIME_ZONE,
})

function parse(iso: string | null | undefined): Date | null {
    if (!iso) return null
    const date = new Date(iso)
    return Number.isNaN(date.getTime()) ? null : date
}

function format(formatter: Intl.DateTimeFormat, iso: string | null | undefined): string {
    const date = parse(iso)
    return date ? formatter.format(date) : ''
}

/** "12/11/2026 13:09" in store time (24h clock). */
export const formatDateTime = (iso: string | null | undefined) =>
    format(dateTimeFormat, iso).replace(',', '')

/** "13:09" in store time (24h clock). */
export const formatTime = (iso: string | null | undefined) => format(timeFormat, iso)

/** "12/11/2026" in store time. */
export const formatDate = (iso: string | null | undefined) => format(dateFormat, iso)

/** "jueves, 12 de noviembre de 2026" in store time. */
export const formatLongDate = (iso: string | null | undefined) => format(longDateFormat, iso)
