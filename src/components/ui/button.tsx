import React from 'react'
import { Loader2 } from 'lucide-react'

const VARIANT_CLASS = {
    primary: 'bg-brand text-white hover:bg-brand-hover',
    secondary: 'bg-muted text-foreground hover:bg-muted/80',
    destructive: 'bg-destructive text-white hover:bg-destructive/90',
    /** No colors: the caller styles it through `className`. */
    plain: '',
} as const

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    /** Shows a spinner and disables the button so the action cannot run twice. */
    loading?: boolean
    /** Text shown instead of the children while loading. */
    loadingLabel?: string
    /** Leading icon, replaced by the spinner while loading. */
    icon?: React.ReactNode
    variant?: keyof typeof VARIANT_CLASS
}

/**
 * Button for actions that hit the backend: pending state and double-submit
 * protection built in. Size, padding and font weight come from `className`.
 */
export function Button({
    loading = false,
    loadingLabel,
    icon,
    variant = 'primary',
    className = '',
    disabled,
    children,
    type = 'button',
    ...props
}: ButtonProps) {
    return (
        <button
            type={type}
            disabled={disabled || loading}
            aria-busy={loading || undefined}
            className={`inline-flex items-center justify-center gap-2 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${VARIANT_CLASS[variant]} ${className}`}
            {...props}
        >
            {loading ? <Loader2 size={18} className="animate-spin shrink-0" aria-hidden="true" /> : icon}
            {loading && loadingLabel ? loadingLabel : children}
        </button>
    )
}
