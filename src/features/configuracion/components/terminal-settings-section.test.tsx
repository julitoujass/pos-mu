// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

const pagos = vi.hoisted(() => ({ updateTerminalSettings: vi.fn() }))
vi.mock('@/features/pagos', () => pagos)
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

import { TerminalSettingsSection } from './terminal-settings-section'

afterEach(() => {
    cleanup()
    pagos.updateTerminalSettings.mockReset()
})

const disabled = { proveedor: 'fake', habilitado: false, conectado: false } as const

describe('TerminalSettingsSection', () => {
    it('shows the provider and the connection status', () => {
        render(<TerminalSettingsSection status={{ ...disabled, conectado: true }} onSaved={vi.fn()} />)
        expect(screen.getByText('fake')).toBeTruthy()
        expect(screen.getByText('Conectado')).toBeTruthy()
    })

    it('shows disconnected when the terminal is not reachable', () => {
        render(<TerminalSettingsSection status={disabled} onSaved={vi.fn()} />)
        expect(screen.getByText('Desconectado')).toBeTruthy()
    })

    it('saves the switch and only the identifiers that were filled in', async () => {
        pagos.updateTerminalSettings.mockResolvedValue({ ...disabled, habilitado: true })
        const onSaved = vi.fn()
        render(<TerminalSettingsSection status={disabled} onSaved={onSaved} />)

        await userEvent.click(screen.getByRole('switch', { name: 'Habilitado' }))
        await userEvent.type(screen.getByLabelText('Serie del dispositivo'), ' C0123 ')
        await userEvent.click(screen.getByRole('button', { name: 'Guardar terminal' }))

        await waitFor(() => expect(onSaved).toHaveBeenCalledTimes(1))
        expect(pagos.updateTerminalSettings).toHaveBeenCalledWith({ habilitado: true, device_id: 'C0123' })
    })

    it('shows the backend error when saving fails', async () => {
        pagos.updateTerminalSettings.mockRejectedValue(new Error('No autorizado'))
        render(<TerminalSettingsSection status={disabled} onSaved={vi.fn()} />)

        await userEvent.click(screen.getByRole('button', { name: 'Guardar terminal' }))

        expect(await screen.findByText('No autorizado')).toBeTruthy()
    })
})
