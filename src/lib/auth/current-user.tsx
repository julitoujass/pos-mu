'use client'

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { fetchMe, type MeResponse } from '@/lib/api'
import { createClient } from '@/lib/supabase/client'
import { getErrorMessage, isInactiveUserError } from '@/lib/errors'

type CurrentUserState = {
    user: MeResponse | null
    isAdmin: boolean
    loading: boolean
}

const CurrentUserContext = createContext<CurrentUserState | null>(null)

/**
 * Loads the profile (`/usuarios/me`) once and shares it with the dashboard.
 * A deactivated user (403 "Usuario inactivo") is signed out and sent to login.
 */
export function CurrentUserProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const [user, setUser] = useState<MeResponse | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let cancelled = false
        async function load() {
            try {
                const me = await fetchMe()
                if (!cancelled) setUser(me)
            } catch (error: unknown) {
                if (cancelled) return
                if (isInactiveUserError(error)) {
                    await createClient().auth.signOut()
                    toast.error('Tu usuario está inactivo. Contactá a un administrador.')
                    router.replace('/')
                    return
                }
                console.error('Error loading profile', error)
                toast.error(getErrorMessage(error, 'No pudimos cargar tu perfil'))
            } finally {
                if (!cancelled) setLoading(false)
            }
        }
        load()
        return () => {
            cancelled = true
        }
    }, [router])

    const value = useMemo<CurrentUserState>(
        () => ({ user, isAdmin: user?.rol === 'admin', loading }),
        [user, loading],
    )

    return <CurrentUserContext.Provider value={value}>{children}</CurrentUserContext.Provider>
}

export function useCurrentUser(): CurrentUserState {
    const ctx = useContext(CurrentUserContext)
    if (!ctx) {
        throw new Error('useCurrentUser must be used inside <CurrentUserProvider>')
    }
    return ctx
}
