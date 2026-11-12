// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ConfirmDialog } from './confirm-dialog'

afterEach(cleanup)

function renderDialog(props: Partial<React.ComponentProps<typeof ConfirmDialog>> = {}) {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    render(
        <ConfirmDialog
            title="Confirmar eliminación"
            message="Esta acción no se puede deshacer."
            confirmLabel="Eliminar"
            onConfirm={onConfirm}
            onCancel={onCancel}
            {...props}
        />,
    )
    return { onConfirm, onCancel }
}

describe('ConfirmDialog', () => {
    it('renders the title, message and labels inside a dialog', () => {
        renderDialog()
        expect(screen.getByRole('dialog', { name: 'Confirmar eliminación' })).toBeInTheDocument()
        expect(screen.getByText('Esta acción no se puede deshacer.')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Eliminar' })).toBeEnabled()
        expect(screen.getByRole('button', { name: 'Cancelar' })).toBeEnabled()
    })

    it('calls onConfirm when the confirm button is clicked', async () => {
        const { onConfirm, onCancel } = renderDialog()
        await userEvent.click(screen.getByRole('button', { name: 'Eliminar' }))
        expect(onConfirm).toHaveBeenCalledTimes(1)
        expect(onCancel).not.toHaveBeenCalled()
    })

    it('calls onCancel from the cancel button and from Escape', async () => {
        const { onConfirm, onCancel } = renderDialog()
        await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
        await userEvent.keyboard('{Escape}')
        expect(onCancel).toHaveBeenCalledTimes(2)
        expect(onConfirm).not.toHaveBeenCalled()
    })

    it('disables both buttons and cannot be dismissed while loading', async () => {
        const { onConfirm, onCancel } = renderDialog({ loading: true })
        expect(screen.getByRole('button', { name: 'Eliminar' })).toBeDisabled()
        expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled()
        await userEvent.keyboard('{Escape}')
        await userEvent.click(screen.getByTestId('modal-backdrop'))
        expect(onConfirm).not.toHaveBeenCalled()
        expect(onCancel).not.toHaveBeenCalled()
    })

    it('uses the custom cancel label and the destructive style', () => {
        renderDialog({ cancelLabel: 'Volver', destructive: true })
        expect(screen.getByRole('button', { name: 'Volver' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Eliminar' }).className).toContain('bg-destructive')
    })
})
