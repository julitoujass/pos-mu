// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { PaymentStatus, TerminalPayment } from '../types'
import { PaymentWaitingModal } from './payment-waiting-modal'

afterEach(cleanup)

function pago(estado: PaymentStatus, extra: Partial<TerminalPayment> = {}): TerminalPayment {
    return {
        id: 'p1',
        estado,
        metodo_pago: 'Tarjeta',
        monto: 15000,
        venta_id: null,
        tarjeta_marca: null,
        tarjeta_ultimos4: null,
        codigo_autorizacion: null,
        cuotas: null,
        error: null,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
        ...extra,
    }
}

function setup(props: Partial<React.ComponentProps<typeof PaymentWaitingModal>> = {}) {
    const handlers = {
        onCancel: vi.fn(),
        onPrintTicket: vi.fn(),
        onRetry: vi.fn(),
        onClose: vi.fn(),
    }
    render(
        <PaymentWaitingModal
            pago={pago('enviado')}
            total={15000}
            method="Tarjeta"
            timedOut={false}
            error={null}
            cancelling={false}
            {...handlers}
            {...props}
        />,
    )
    return handlers
}

describe('PaymentWaitingModal', () => {
    it('shows the total, the method and a cancel button while waiting for the customer', async () => {
        const { onCancel } = setup()
        expect(screen.getByRole('dialog')).toBeTruthy()
        expect(screen.getByText('Esperando pago en el Clover…')).toBeTruthy()
        expect(screen.getByText(/15\.000,00/)).toBeTruthy()
        expect(screen.getByText('Tarjeta')).toBeTruthy()

        await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
        expect(onCancel).toHaveBeenCalledTimes(1)
    })

    it('waits before the first poll answers', () => {
        setup({ pago: null })
        expect(screen.getByText('Esperando pago en el Clover…')).toBeTruthy()
    })

    it('disables cancel while the cancellation is in flight', () => {
        setup({ cancelling: true })
        expect(screen.getByRole('button', { name: /Cancelando/ }).hasAttribute('disabled')).toBe(true)
    })

    it('shows that the sale is being registered, without actions', () => {
        setup({ pago: pago('aprobado') })
        expect(screen.getByText('Registrando la venta…')).toBeTruthy()
        expect(screen.queryByRole('button', { name: 'Cancelar' })).toBeNull()
    })

    it('shows that the payment is being verified', () => {
        setup({ pago: pago('indeterminado') })
        expect(screen.getByText('Verificando el pago…')).toBeTruthy()
    })

    it('shows the card data on success and offers ticket and new sale', async () => {
        const { onPrintTicket, onClose } = setup({
            pago: pago('venta_registrada', {
                venta_id: 'v1',
                tarjeta_marca: 'VISA',
                tarjeta_ultimos4: '4242',
                codigo_autorizacion: '123456',
            }),
        })
        expect(screen.getByText('Pago aprobado')).toBeTruthy()
        expect(screen.getByText(/VISA/)).toBeTruthy()
        expect(screen.getByText(/4242/)).toBeTruthy()
        expect(screen.getByText(/123456/)).toBeTruthy()

        await userEvent.click(screen.getByRole('button', { name: 'Imprimir ticket' }))
        expect(onPrintTicket).toHaveBeenCalledWith('v1')
        await userEvent.click(screen.getByRole('button', { name: 'Nueva venta' }))
        expect(onClose).toHaveBeenCalledTimes(1)
    })

    it.each<PaymentStatus>(['rechazado', 'cancelado'])('offers retry or another method when %s', async estado => {
        const { onRetry, onClose } = setup({ pago: pago(estado) })
        expect(screen.getByText('Pago no aprobado')).toBeTruthy()

        await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }))
        expect(onRetry).toHaveBeenCalledTimes(1)
        await userEvent.click(screen.getByRole('button', { name: 'Cambiar método' }))
        expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('explains the refund when the sale could not be registered', async () => {
        const { onClose } = setup({ pago: pago('reembolsado', { error: 'Stock insuficiente' }) })
        expect(screen.getByText('No se pudo registrar la venta. El cobro fue reembolsado.')).toBeTruthy()
        expect(screen.getByText('Stock insuficiente')).toBeTruthy()
        await userEvent.click(screen.getByRole('button', { name: 'Cerrar' }))
        expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('tells the cashier to follow up from "Pagos a revisar" after the timeout', () => {
        setup({ pago: pago('indeterminado'), timedOut: true })
        expect(screen.getByText(/Pagos a revisar/)).toBeTruthy()
        expect(screen.getByRole('button', { name: 'Cerrar' })).toBeTruthy()
    })

    it('shows polling errors', () => {
        setup({ error: 'sin red' })
        expect(screen.getByText('sin red')).toBeTruthy()
    })

    it('announces state changes politely', () => {
        setup()
        expect(screen.getByRole('status').getAttribute('aria-live')).toBe('polite')
    })
})
