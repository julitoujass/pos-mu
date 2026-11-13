// @vitest-environment jsdom
import { cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

const pagos = vi.hoisted(() => ({
    updateTerminalSettings: vi.fn(),
    fetchCloverAuthorizeUrl: vi.fn(),
    disconnectClover: vi.fn(),
    fetchTerminalStatus: vi.fn(),
}))
vi.mock('@/features/pagos', () => pagos)
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

import { TerminalSettingsSection } from './terminal-settings-section'

afterEach(() => {
    cleanup()
    Object.values(pagos).forEach(fn => fn.mockReset())
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

    it('shows a simulated-terminal note for the fake provider', () => {
        render(<TerminalSettingsSection status={disabled} onSaved={vi.fn()} />)
        expect(screen.getByText('Terminal simulado (desarrollo)')).toBeTruthy()
        expect(screen.queryByRole('button', { name: 'Conectar Clover' })).toBeNull()
    })
})

const clover = { proveedor: 'clover', habilitado: false, conectado: false, conectado_oauth: false } as const
const linked = { ...clover, conectado_oauth: true, merchant_id: 'MID123', device_id: 'C0123' } as const

describe('TerminalSettingsSection (Clover)', () => {
    it('offers to connect when the account is not linked and blocks enabling', () => {
        render(<TerminalSettingsSection status={clover} onSaved={vi.fn()} />)
        expect(screen.getByText('No conectada')).toBeTruthy()
        expect(screen.getByRole('button', { name: 'Conectar Clover' })).toBeTruthy()
        expect((screen.getByRole('switch', { name: 'Habilitado' }) as HTMLInputElement).disabled).toBe(true)
        expect(screen.getByText(/Conectá la cuenta de Clover/)).toBeTruthy()
    })

    it('navigates to the authorize url when connecting', async () => {
        const assign = vi.fn()
        Object.defineProperty(window, 'location', { value: { assign }, configurable: true })
        pagos.fetchCloverAuthorizeUrl.mockResolvedValue('https://clover.test/oauth')
        render(<TerminalSettingsSection status={clover} onSaved={vi.fn()} />)

        await userEvent.click(screen.getByRole('button', { name: 'Conectar Clover' }))

        await waitFor(() => expect(assign).toHaveBeenCalledWith('https://clover.test/oauth'))
    })

    it('shows the merchant when linked and allows enabling once the device is set', () => {
        render(<TerminalSettingsSection status={linked} onSaved={vi.fn()} />)
        expect(screen.getByText('Conectada (merchant MID123)')).toBeTruthy()
        expect(screen.queryByRole('button', { name: 'Conectar Clover' })).toBeNull()
        expect((screen.getByRole('switch', { name: 'Habilitado' }) as HTMLInputElement).disabled).toBe(false)
    })

    it('keeps the switch blocked while the device serial is empty', () => {
        render(<TerminalSettingsSection status={{ ...linked, device_id: null }} onSaved={vi.fn()} />)
        expect((screen.getByRole('switch', { name: 'Habilitado' }) as HTMLInputElement).disabled).toBe(true)
        expect(screen.getByText(/serie del dispositivo/i, { selector: 'p' })).toBeTruthy()
    })

    it('disconnects after confirming', async () => {
        pagos.disconnectClover.mockResolvedValue(clover)
        const onSaved = vi.fn()
        render(<TerminalSettingsSection status={linked} onSaved={onSaved} />)

        await userEvent.click(screen.getByRole('button', { name: 'Desconectar' }))
        expect(pagos.disconnectClover).not.toHaveBeenCalled()
        await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Desconectar' }))

        await waitFor(() => expect(onSaved).toHaveBeenCalledTimes(1))
        expect(pagos.disconnectClover).toHaveBeenCalledTimes(1)
    })

    it('tests the connection and reports the device state', async () => {
        pagos.fetchTerminalStatus.mockResolvedValueOnce({ ...linked, conectado: true })
        render(<TerminalSettingsSection status={linked} onSaved={vi.fn()} />)
        await userEvent.click(screen.getByRole('button', { name: 'Probar conexión' }))
        expect(await screen.findByText('Dispositivo conectado')).toBeTruthy()

        pagos.fetchTerminalStatus.mockResolvedValueOnce({ ...linked, conectado: false })
        await userEvent.click(screen.getByRole('button', { name: 'Probar conexión' }))
        expect(await screen.findByText('Sin respuesta del dispositivo')).toBeTruthy()
    })
})
