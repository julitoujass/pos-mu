// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { RouteProgress } from './route-progress'

let pathname = '/dashboard'
vi.mock('next/navigation', () => ({ usePathname: () => pathname }))

function Page() {
    return (
        <>
            <RouteProgress />
            <a href="/dashboard/caja" onClick={e => e.preventDefault()}>Caja</a>
            <a href="/dashboard" onClick={e => e.preventDefault()}>Inicio</a>
            <a href="https://example.com/x" onClick={e => e.preventDefault()}>Externo</a>
        </>
    )
}

function bar() {
    return screen.getByRole('progressbar', { hidden: true })
}

describe('RouteProgress', () => {
    beforeEach(() => {
        pathname = '/dashboard'
        window.history.replaceState(null, '', '/dashboard')
    })
    afterEach(cleanup)

    it('is hidden until a navigation starts', () => {
        render(<Page />)
        expect(bar().dataset.active).toBe('false')
    })

    it('shows while an internal navigation is pending and hides when the route changes', () => {
        const { rerender } = render(<Page />)

        fireEvent.click(screen.getByText('Caja'))
        expect(bar().dataset.active).toBe('true')

        pathname = '/dashboard/caja'
        rerender(<Page />)
        expect(bar().dataset.active).toBe('false')
    })

    it('ignores links to the current page, external links and modified clicks', () => {
        render(<Page />)

        fireEvent.click(screen.getByText('Inicio'))
        fireEvent.click(screen.getByText('Externo'))
        fireEvent.click(screen.getByText('Caja'), { ctrlKey: true })

        expect(bar().dataset.active).toBe('false')
    })
})
