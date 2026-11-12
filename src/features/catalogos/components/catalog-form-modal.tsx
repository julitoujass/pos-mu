'use client'

import React, { useId } from 'react'
import { Loader2 } from 'lucide-react'
import { FormError } from '@/components/ui/form-error'
import { Modal } from '@/components/ui/modal'

type CatalogFormModalProps = {
    title: string
    subtitle: string
    icon: React.ReactNode
    mode: 'create' | 'edit'
    loading: boolean
    error: string | null
    onClose: () => void
    onSubmit: (e: React.FormEvent) => void
    /** Form fields. */
    children: React.ReactNode
}

/** Header / scrollable body / footer shell shared by the brand and category forms. */
export function CatalogFormModal({
    title,
    subtitle,
    icon,
    mode,
    loading,
    error,
    onClose,
    onSubmit,
    children,
}: CatalogFormModalProps) {
    const titleId = useId()
    const formId = useId()

    return (
        <Modal
            onClose={onClose}
            labelledBy={titleId}
            className="bg-card rounded-3xl w-full max-w-md shadow-2xl border border-border flex flex-col max-h-[90vh]"
        >
            <div className="p-6 border-b border-border flex items-center justify-between">
                <div>
                    <h2 id={titleId} className="text-xl font-bold text-foreground">{title}</h2>
                    <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center">
                    {icon}
                </div>
            </div>

            <div className="p-6 overflow-y-auto">
                <form id={formId} onSubmit={onSubmit} className="space-y-4">
                    {children}
                </form>

                <FormError message={error} className="mt-4" />
            </div>

            <div className="p-6 border-t border-border bg-muted/30 flex gap-3 rounded-b-3xl mt-auto">
                <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-input bg-card text-foreground font-medium hover:bg-muted transition-colors">
                    Cancelar
                </button>
                <button type="submit" form={formId} disabled={loading} className="flex-1 py-2.5 rounded-xl bg-brand text-white font-medium hover:bg-brand-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-brand/20">
                    {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                    {mode === 'edit' ? 'Guardar' : 'Crear'}
                </button>
            </div>
        </Modal>
    )
}

export const CATALOG_INPUT_CLASS = 'w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-brand focus:border-transparent transition-all'
export const CATALOG_LABEL_CLASS = 'block text-sm font-medium text-foreground mb-1'
