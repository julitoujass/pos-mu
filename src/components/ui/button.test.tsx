// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Button } from './button'

describe('Button', () => {
    afterEach(cleanup)

    it('runs the action when idle', () => {
        const onClick = vi.fn()
        render(<Button onClick={onClick}>Guardar</Button>)

        fireEvent.click(screen.getByRole('button', { name: 'Guardar' }))

        expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('cannot be triggered again while loading', () => {
        const onClick = vi.fn()
        render(<Button loading loadingLabel="Guardando..." onClick={onClick}>Guardar</Button>)

        const button = screen.getByRole('button', { name: 'Guardando...' })
        fireEvent.click(button)

        expect(button).toHaveProperty('disabled', true)
        expect(button.getAttribute('aria-busy')).toBe('true')
        expect(onClick).not.toHaveBeenCalled()
    })
})
