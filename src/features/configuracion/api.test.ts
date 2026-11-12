import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { jsonResponse } from '@/test/json-response'

vi.mock('@/lib/supabase/client', () => ({
    createClient: () => ({
        auth: {
            getSession: async () => ({
                data: { session: { access_token: 'test-token' } },
                error: null,
            }),
        },
    }),
}))

import { fetchSettings, updateSettings } from './api'

const fetchMock = vi.fn()

beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
    vi.unstubAllGlobals()
})

describe('fetchSettings', () => {
    it('gets /configuracion', async () => {
        fetchMock.mockResolvedValue(jsonResponse({ id: 1, nombre_negocio: 'Mundo Uniforme', descuento_max_empleado: 10 }))
        const settings = await fetchSettings()
        expect(settings.nombre_negocio).toBe('Mundo Uniforme')
        expect(fetchMock.mock.calls[0][0]).toBe('/api/python/configuracion')
    })
})

describe('updateSettings', () => {
    it('PATCHes only the given fields', async () => {
        fetchMock.mockResolvedValue(jsonResponse({ id: 1, descuento_max_empleado: 15 }))
        await updateSettings({ descuento_max_empleado: 15 })
        const [url, init] = fetchMock.mock.calls[0]
        expect(url).toBe('/api/python/configuracion')
        expect(init.method).toBe('PATCH')
        expect(JSON.parse(init.body)).toEqual({ descuento_max_empleado: 15 })
    })

    it('throws the backend detail on 403', async () => {
        fetchMock.mockResolvedValue(jsonResponse({ detail: 'No autorizado' }, 403))
        await expect(updateSettings({ cuit: '1' })).rejects.toThrow('No autorizado')
    })
})
