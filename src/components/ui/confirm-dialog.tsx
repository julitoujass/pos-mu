'use client'

import React, { useId } from 'react'
import { Loader2 } from 'lucide-react'
import { Modal } from './modal'

type ConfirmDialogProps = {
    title: string
    message?: React.ReactNode
    confirmLabel?: string
    cancelLabel?: string
    /** Red confirm button for irreversible actions. */
    destructive?: boolean
    /** Disables both buttons and blocks dismissal while the action runs. */
    loading?: boolean
    /** Optional icon shown in a circle above the title. */
    icon?: React.ReactNode
    onConfirm: () => void
    onCancel: () => void
}

export function ConfirmDialog({
    title,
    message,
    confirmLabel = 'Confirmar',
    cancelLabel = 'Cancelar',
    destructive = false,
    loading = false,
    icon,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    const titleId = useId()
    const tone = destructive
        ? { circle: 'bg-destructive/10', button: 'bg-destructive hover:bg-destructive/90' }
        : { circle: 'bg-brand/10', button: 'bg-brand hover:bg-brand-hover' }

    return (
        <Modal
            onClose={onCancel}
            labelledBy={titleId}
            dismissible={!loading}
            className="bg-card rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-border"
        >
            {icon && (
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto ${tone.circle}`}>
                    {icon}
                </div>
            )}
            <h2 id={titleId} className={`text-xl font-bold text-foreground text-center ${message ? 'mb-2' : 'mb-6'}`}>
                {title}
            </h2>
            {message && <div className="text-muted-foreground text-center mb-6 text-sm">{message}</div>}

            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    className="flex-1 py-2.5 rounded-xl border border-input bg-card text-foreground font-medium hover:bg-muted transition-colors"
                >
                    {cancelLabel}
                </button>
                <button
                    type="button"
                    onClick={onConfirm}
                    disabled={loading}
                    className={`flex-1 py-2.5 rounded-xl text-white font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${tone.button}`}
                >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {confirmLabel}
                </button>
            </div>
        </Modal>
    )
}
