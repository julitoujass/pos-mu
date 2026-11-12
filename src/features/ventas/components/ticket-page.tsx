'use client'

import { useEffect, useRef } from 'react'
import { useBusinessSettings } from '@/features/configuracion'
import { useSaleDetail } from '../hooks/use-sale-detail'
import { TicketView } from './ticket-view'

// `@page` rules are global; they only matter while this page is mounted.
const PRINT_CSS = `
@page { size: 80mm auto; margin: 0; }
.ticket-root { background: #fff; color: #000; min-height: 100vh; }
.ticket-paper {
    font-family: "Courier New", Courier, monospace;
    font-size: 11px;
    line-height: 1.25;
    width: 72mm;
    margin: 0 auto;
    padding: 4mm 0;
    white-space: pre;
    background: #fff;
    color: #000;
}
@media print {
    html, body { background: #fff !important; }
    .ticket-root { min-height: 0; }
    .ticket-paper { margin: 0; padding: 4mm; }
    .ticket-hint { display: none; }
}
`

/** Standalone ticket page: loads the sale and business data, then opens the print dialog once. */
export function TicketPage({ saleId }: { saleId: string }) {
    const { sale, loading, error } = useSaleDetail(saleId)
    const { settings, loading: settingsLoading } = useBusinessSettings()
    const printed = useRef(false)

    const ready = !!sale && !settingsLoading
    useEffect(() => {
        if (!ready || printed.current) return
        printed.current = true
        // Wait a frame so the ticket is painted before the dialog opens.
        const id = window.requestAnimationFrame(() => window.print())
        return () => window.cancelAnimationFrame(id)
    }, [ready])

    return (
        <div className="ticket-root">
            <style>{PRINT_CSS}</style>
            {(loading || settingsLoading) && <p className="ticket-hint p-4 text-sm">Preparando ticket...</p>}
            {error && <p className="ticket-hint p-4 text-sm">{error}</p>}
            {ready && sale && <TicketView sale={sale} settings={settings} />}
            {ready && (
                <p className="ticket-hint p-4 text-center text-sm">
                    <button onClick={() => window.print()} className="underline">Imprimir de nuevo</button>
                </p>
            )}
        </div>
    )
}
