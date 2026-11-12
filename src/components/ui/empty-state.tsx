import React from 'react'
import type { LucideIcon } from 'lucide-react'

type EmptyStateProps = {
    icon: LucideIcon
    message: string
    /** Optional call to action rendered below the message. */
    children?: React.ReactNode
}

/** Card shown when a list has nothing to display. */
export function EmptyState({ icon: Icon, message, children }: EmptyStateProps) {
    return (
        <div className="text-center py-12 bg-card rounded-2xl border border-border">
            <Icon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{message}</p>
            {children}
        </div>
    )
}
