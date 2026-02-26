'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, Lock, Loader2, KeyRound } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function LoginForm() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const router = useRouter()
    const supabase = createClient()

    async function handleSignIn(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        // Check if env vars are missing
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            setError('Error de configuración: Faltan variables de entorno.')
            setLoading(false)
            return
        }

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setError('Credenciales inválidas. Por favor intenta de nuevo.')
            console.error('Login error:', error.message)
        } else {
            // Successful login
            router.push('/dashboard') // Redirect to dashboard (to be created)
            router.refresh()
        }
        setLoading(false)
    }

    return (
        <div className="w-full max-w-md p-8 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl relative overflow-hidden group">

            {/* Decorative gradient blob inside card */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand/10 rounded-full blur-2xl transition-all duration-500 group-hover:bg-brand/20"></div>

            <div className="mb-8 text-center relative z-10">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-brand/10 mb-4 ring-1 ring-brand/20">
                    <KeyRound className="w-10 h-10 text-brand" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Bienvenido</h2>
                <p className="text-gray-500 dark:text-gray-300 mt-2">Inicia sesión en Mundo Uniforme</p>
            </div>

            <form onSubmit={handleSignIn} className="space-y-6 relative z-10">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">Email</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-gray-400 group-focus-within:text-brand transition-colors" />
                        </div>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all duration-200"
                            placeholder="tu@email.com"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">Contraseña</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-brand transition-colors" />
                        </div>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all duration-200"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400 animate-pulse">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-3.5 px-4 rounded-xl shadow-lg shadow-brand/20 text-sm font-bold text-white bg-brand hover:bg-brand-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:-translate-y-0.5"
                >
                    {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        'Ingresar'
                    )}
                </button>
            </form>
        </div>
    )
}
