/** Today's calendar date in Argentina as YYYY-MM-DD (the shop's local day). */
export function todayInArgentina(now: Date = new Date()): string {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Argentina/Buenos_Aires',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(now)
}
