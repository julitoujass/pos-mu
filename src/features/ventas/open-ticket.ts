/** Opens the printable ticket of a sale in a new tab (it prints itself once loaded). */
export function openTicket(saleId: string): void {
    window.open(`/ticket/${saleId}`, '_blank')
}
