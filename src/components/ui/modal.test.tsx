// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Modal } from './modal'

afterEach(cleanup)

function renderModal(props: Partial<React.ComponentProps<typeof Modal>> = {}) {
    const onClose = vi.fn()
    render(
        <Modal onClose={onClose} labelledBy="modal-title" {...props}>
            <h2 id="modal-title">Nuevo Producto</h2>
            <button type="button">Primero</button>
            <button type="button">Último</button>
        </Modal>,
    )
    return { onClose }
}

describe('Modal', () => {
    it('exposes an accessible modal dialog labelled by its title', () => {
        renderModal()
        const dialog = screen.getByRole('dialog', { name: 'Nuevo Producto' })
        expect(dialog).toHaveAttribute('aria-modal', 'true')
        expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title')
    })

    it('closes on Escape', async () => {
        const { onClose } = renderModal()
        await userEvent.keyboard('{Escape}')
        expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('closes when the backdrop is clicked', async () => {
        const { onClose } = renderModal()
        await userEvent.click(screen.getByTestId('modal-backdrop'))
        expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('does not close when the dialog content is clicked', async () => {
        const { onClose } = renderModal()
        await userEvent.click(screen.getByRole('heading', { name: 'Nuevo Producto' }))
        expect(onClose).not.toHaveBeenCalled()
    })

    it('ignores Escape and backdrop clicks when not dismissible', async () => {
        const { onClose } = renderModal({ dismissible: false })
        await userEvent.keyboard('{Escape}')
        await userEvent.click(screen.getByTestId('modal-backdrop'))
        expect(onClose).not.toHaveBeenCalled()
    })

    it('moves focus into the dialog and restores it on close', () => {
        const trigger = document.createElement('button')
        document.body.appendChild(trigger)
        trigger.focus()

        const { unmount } = render(
            <Modal onClose={() => {}} labelledBy="t">
                <h2 id="t">Título</h2>
            </Modal>,
        )
        expect(screen.getByRole('dialog')).toHaveFocus()

        unmount()
        expect(trigger).toHaveFocus()
        trigger.remove()
    })

    it('keeps Tab focus inside the dialog', async () => {
        renderModal()
        const last = screen.getByRole('button', { name: 'Último' })
        last.focus()
        await userEvent.tab()
        expect(screen.getByRole('button', { name: 'Primero' })).toHaveFocus()
        await userEvent.tab({ shift: true })
        expect(last).toHaveFocus()
    })
})
