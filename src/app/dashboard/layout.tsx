'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    ShoppingCart,
    Receipt,
    Package,
    Users,
    Banknote,
    Settings,
    LogOut,
    Menu,
    X,
    BarChart2,
    Tags,
    AlertTriangle,
    ScrollText,
    CreditCard,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { RouteProgress } from '@/components/ui/route-progress'
import { CurrentUserProvider, useCurrentUser } from '@/features/auth'

const sidebarItems = [
    { name: 'Panel Principal', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Nueva Venta', href: '/dashboard/venta', icon: ShoppingCart },
    { name: 'Historial', href: '/dashboard/historial', icon: Receipt },
    { name: 'Caja', href: '/dashboard/caja', icon: Banknote },
    { name: 'Productos', href: '/dashboard/productos', icon: Package },
    { name: 'Stock bajo', href: '/dashboard/stock-bajo', icon: AlertTriangle },
    { name: 'Catálogos', href: '/dashboard/catalogos', icon: Tags },
    { name: 'Clientes', href: '/dashboard/clientes', icon: Users },
    { name: 'Reportes', href: '/dashboard/reportes', icon: BarChart2, adminOnly: true },
    { name: 'Usuarios', href: '/dashboard/usuarios', icon: Users, adminOnly: true },
    { name: 'Pagos', href: '/dashboard/pagos', icon: CreditCard, adminOnly: true },
    { name: 'Auditoría', href: '/dashboard/auditoria', icon: ScrollText, adminOnly: true },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <CurrentUserProvider>
            <DashboardShell>{children}</DashboardShell>
        </CurrentUserProvider>
    )
}

function DashboardShell({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [signingOut, setSigningOut] = useState(false)
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()
    const { isAdmin } = useCurrentUser()

    async function handleSignOut() {
        setSigningOut(true)
        try {
            await supabase.auth.signOut()
            router.push('/')
        } catch {
            setSigningOut(false)
        }
    }

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
            <RouteProgress />
            {/* Mobile Header */}
            <div className="lg:hidden flex items-center justify-between p-4 bg-card border-b border-border sticky top-0 z-30">
                <span className="font-bold text-xl flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center text-white font-bold shadow-lg shadow-brand/20">MU</div>
                    <span>Mundo <span className="text-brand">Uniforme</span></span>
                </span>
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                    {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border transform transition-all duration-300 ease-in-out lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
                <div className="h-full flex flex-col">
                    <div className="p-6 border-b border-border flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center text-white font-bold shadow-lg shadow-brand/20">
                            MU
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-lg leading-tight">Mundo Uniforme</span>
                            <span className="text-xs text-muted-foreground font-medium">POS System v1.0</span>
                        </div>
                    </div>

                    <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                        {sidebarItems.map((item) => {
                            if (item.adminOnly && !isAdmin) return null;

                            const isActive = pathname === item.href
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${isActive
                                        ? 'bg-brand text-white shadow-lg shadow-brand/25'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                        }`}
                                    onClick={() => setIsSidebarOpen(false)}
                                >
                                    <item.icon size={20} className={`transition-colors ${isActive ? 'text-white' : 'text-muted-foreground group-hover:text-foreground'}`} />
                                    {item.name}
                                </Link>
                            )
                        })}
                    </nav>

                    <div className="p-4 border-t border-border space-y-2 bg-card/50 backdrop-blur-sm">
                        <div className="flex items-center justify-between px-3 py-2 text-sm font-medium text-muted-foreground mb-2">
                            <span>Preferencias</span>
                            <ThemeToggle />
                        </div>

                        {isAdmin && (
                            <Link
                                href="/dashboard/settings"
                                onClick={() => setIsSidebarOpen(false)}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                            >
                                <Settings size={20} />
                                Configuración
                            </Link>
                        )}
                        <Button
                            variant="plain"
                            onClick={handleSignOut}
                            loading={signingOut}
                            loadingLabel="Cerrando sesión..."
                            icon={<LogOut size={20} />}
                            className="w-full justify-start! gap-3! px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10"
                        >
                            Cerrar Sesión
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="lg:pl-72 min-h-screen transition-all duration-300">
                {/* Keyed by route so each page fades in. Opacity only: a transform here would
                    break the `position: fixed` modals rendered inside the pages. */}
                <div key={pathname} className="p-6 lg:p-10 max-w-7xl mx-auto animate-fade-in">
                    {children}
                </div>
            </main>

            {/* Overlay for mobile sidebar */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
        </div>
    )
}
