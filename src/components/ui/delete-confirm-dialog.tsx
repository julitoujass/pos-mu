'use client'

import { Trash2 } from 'lucide-react'
import { ConfirmDialog } from './confirm-dialog'

type DeleteConfirmDialogProps = {
    /** What is being deleted, e.g. el producto "Camisa". */
    label: string
    loading: boolean
    onConfirm: () => void
    onCancel: () => void
}

/** Standard "Confirmar eliminación" dialog shared by every delete action. */
export function DeleteConfirmDialog({ label, loading, onConfirm, onCancel }: DeleteConfirmDialogProps) {
    return (
        <ConfirmDialog
            title="Confirmar eliminación"
            message={<>¿Estás seguro de que deseas eliminar <b>{label}</b>? Esta acción no se puede deshacer.</>}
            confirmLabel="Eliminar"
            destructive
            loading={loading}
            icon={<Trash2 className="w-6 h-6 text-destructive" />}
            onConfirm={onConfirm}
            onCancel={onCancel}
        />
    )
}
