'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

/** Safety net: hide the bar if the navigation never completes. */
const MAX_PENDING_MS = 10_000

/** Internal link that will actually change the route when clicked. */
function navigationTarget(event: MouseEvent): string | null {
    if (event.defaultPrevented || event.button !== 0) return null
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return null
    const anchor = (event.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null
    if (!anchor || (anchor.target && anchor.target !== '_self') || anchor.hasAttribute('download')) return null
    const url = new URL(anchor.href, window.location.href)
    if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return null
    return url.pathname
}

/**
 * Slim top bar shown while a route transition is pending. It starts when an
 * internal link is clicked and ends when the pathname changes, so it needs no
 * router events and no dependency.
 */
export function RouteProgress() {
    const pathname = usePathname()
    // Pathname the pending navigation started from; the bar is active while we are still there.
    const [pendingFrom, setPendingFrom] = useState<string | null>(null)
    // The route changed: the navigation is over (adjusting state during render, no effect needed).
    if (pendingFrom !== null && pendingFrom !== pathname) setPendingFrom(null)
    const active = pendingFrom !== null && pendingFrom === pathname

    useEffect(() => {
        function handleClick(event: MouseEvent) {
            if (navigationTarget(event)) setPendingFrom(window.location.pathname)
        }
        // Capture phase: runs before next/link calls preventDefault on the click.
        document.addEventListener('click', handleClick, true)
        return () => document.removeEventListener('click', handleClick, true)
    }, [])

    useEffect(() => {
        if (!active) return
        const id = setTimeout(() => setPendingFrom(null), MAX_PENDING_MS)
        return () => clearTimeout(id)
    }, [active])

    return (
        <div
            role="progressbar"
            aria-label="Cargando página"
            aria-hidden={!active}
            data-active={active}
            className={`fixed top-0 inset-x-0 z-[60] h-0.5 pointer-events-none transition-opacity duration-200 ${active ? 'opacity-100' : 'opacity-0'}`}
        >
            {active && <div className="h-full w-full origin-left bg-brand shadow-[0_0_8px_var(--color-brand)] animate-route-progress" />}
        </div>
    )
}
