import React from 'react'
import { Loader2 } from 'lucide-react'

type RefreshableProps = {
    /** True while the data on screen is being reloaded. */
    refreshing: boolean
    children: React.ReactNode
    /** Set to false when the content hosts its own modals, which must not be dimmed. */
    dim?: boolean
    className?: string
}

/**
 * Wraps content that stays on screen while it reloads: dims it slightly and
 * shows a small spinner instead of swapping to a skeleton. The dimming starts
 * after a short delay so fast responses do not flash.
 */
export function Refreshable({ refreshing, children, dim = true, className = '' }: RefreshableProps) {
    return (
        <div className={`relative ${className}`} aria-busy={refreshing}>
            <div className={`transition-opacity duration-200 ${refreshing && dim ? 'opacity-60 delay-150' : 'opacity-100'}`}>
                {children}
            </div>
            {refreshing && (
                <div
                    role="status"
                    className="absolute top-3 right-3 flex items-center gap-2 px-2.5 py-1 rounded-full bg-card border border-border shadow-sm text-xs text-muted-foreground animate-fade-in"
                >
                    <Loader2 size={14} className="animate-spin text-brand" aria-hidden="true" />
                    Actualizando...
                </div>
            )}
        </div>
    )
}
