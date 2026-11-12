'use client'

import React, { useEffect, useRef } from 'react'

const FOCUSABLE_SELECTOR =
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

// Open modals in mount order; only the last one (topmost) reacts to Escape.
const openModalStack: symbol[] = []

const BACKDROP_CLASS = {
    default: 'bg-black/50',
    strong: 'bg-black/60',
} as const

type ModalProps = {
    onClose: () => void
    /** Id of the element that titles the dialog (aria-labelledby). */
    labelledBy: string
    children: React.ReactNode
    /** Classes of the dialog panel: size, padding, radius, border... */
    className?: string
    backdrop?: keyof typeof BACKDROP_CLASS
    /** When false, Escape and backdrop clicks do not close the dialog. */
    dismissible?: boolean
}

/**
 * Accessible modal shell: role="dialog", Escape and backdrop close it, focus
 * moves into the dialog on open, stays inside while tabbing and returns to the
 * previously focused element on close. Render it conditionally to open it.
 */
export function Modal({
    onClose,
    labelledBy,
    children,
    className = '',
    backdrop = 'default',
    dismissible = true,
}: ModalProps) {
    const panelRef = useRef<HTMLDivElement>(null)
    const stackIdRef = useRef<symbol>(Symbol('modal'))

    useEffect(() => {
        const id = stackIdRef.current
        openModalStack.push(id)
        return () => {
            const index = openModalStack.lastIndexOf(id)
            if (index !== -1) openModalStack.splice(index, 1)
        }
    }, [])

    useEffect(() => {
        const previouslyFocused = document.activeElement as HTMLElement | null
        const panel = panelRef.current
        if (panel && !panel.contains(document.activeElement)) {
            panel.focus()
        }
        return () => {
            previouslyFocused?.focus?.()
        }
    }, [])

    useEffect(() => {
        if (!dismissible) return
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key !== 'Escape') return
            if (openModalStack[openModalStack.length - 1] !== stackIdRef.current) return
            onClose()
        }
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [dismissible, onClose])

    function handleBackdropMouseDown(e: React.MouseEvent<HTMLDivElement>) {
        if (dismissible && e.target === e.currentTarget) onClose()
    }

    function trapFocus(e: React.KeyboardEvent<HTMLDivElement>) {
        if (e.key !== 'Tab') return
        const panel = panelRef.current
        if (!panel) return
        const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
        if (focusable.length === 0) {
            e.preventDefault()
            return
        }
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        const active = document.activeElement
        if (e.shiftKey && (active === first || active === panel)) {
            e.preventDefault()
            last.focus()
        } else if (!e.shiftKey && active === last) {
            e.preventDefault()
            first.focus()
        }
    }

    return (
        <div
            data-testid="modal-backdrop"
            onMouseDown={handleBackdropMouseDown}
            className={`fixed inset-0 z-50 flex items-center justify-center ${BACKDROP_CLASS[backdrop]} backdrop-blur-sm p-4 animate-in fade-in duration-200`}
        >
            <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={labelledBy}
                tabIndex={-1}
                onKeyDown={trapFocus}
                className={`outline-none ${className}`}
            >
                {children}
            </div>
        </div>
    )
}
