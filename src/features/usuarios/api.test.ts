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

import { createUser, updateUserActive, updateUserRole } from './api'

const fetchMock = vi.fn()

beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
    vi.unstubAllGlobals()
})

describe('updateUserActive', () => {
    it('PATCHes /usuarios/{id}/activo with the flag', async () => {
        fetchMock.mockResolvedValue(jsonResponse({ id: 'u1', nombre: 'A', activo: false, created_at: 'now' }))
        const res = await updateUserActive('u1', false)
        expect(res.activo).toBe(false)
        const [url, init] = fetchMock.mock.calls[0]
        expect(url).toBe('/api/python/usuarios/u1/activo')
        expect(init.method).toBe('PATCH')
        expect(JSON.parse(init.body)).toEqual({ activo: false })
    })

    it('throws the backend detail on 409', async () => {
        fetchMock.mockResolvedValue(
            jsonResponse({ detail: 'Debe quedar al menos un administrador activo' }, 409),
        )
        await expect(updateUserActive('u1', false)).rejects.toThrow(
            'Debe quedar al menos un administrador activo',
        )
    })
})

describe('updateUserRole', () => {
    it('PATCHes /usuarios/{id}/rol with the role id', async () => {
        fetchMock.mockResolvedValue(jsonResponse({ id: 'u1', nombre: 'A', activo: true, created_at: 'now' }))
        await updateUserRole('u1', 2)
        const [url, init] = fetchMock.mock.calls[0]
        expect(url).toBe('/api/python/usuarios/u1/rol')
        expect(init.method).toBe('PATCH')
        expect(JSON.parse(init.body)).toEqual({ rol_id: 2 })
    })

    it('throws the backend detail on 409', async () => {
        fetchMock.mockResolvedValue(
            jsonResponse({ detail: 'No podés quitarte el rol de administrador' }, 409),
        )
        await expect(updateUserRole('u1', 2)).rejects.toThrow(
            'No podés quitarte el rol de administrador',
        )
    })
})

describe('createUser', () => {
    it('POSTs the new user to /usuarios/', async () => {
        fetchMock.mockResolvedValue(jsonResponse({ id: 'u9', nombre: 'Ana', email: 'a@b.com', activo: true, created_at: 'now' }))
        const res = await createUser({ email: 'a@b.com', password: '12345678', nombre: 'Ana', rol_id: 2 })
        expect(res.email).toBe('a@b.com')
        const [url, init] = fetchMock.mock.calls[0]
        expect(url).toBe('/api/python/usuarios/')
        expect(init.method).toBe('POST')
        expect(JSON.parse(init.body)).toEqual({ email: 'a@b.com', password: '12345678', nombre: 'Ana', rol_id: 2 })
    })

    it('throws the backend detail on 409', async () => {
        fetchMock.mockResolvedValue(jsonResponse({ detail: 'Ya existe un usuario con ese email' }, 409))
        await expect(createUser({ email: 'a@b.com', password: '12345678', nombre: 'Ana', rol_id: 2 })).rejects.toThrow(
            'Ya existe un usuario con ese email',
        )
    })
})
