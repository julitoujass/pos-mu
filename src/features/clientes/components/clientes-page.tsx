'use client'

import { useState } from 'react'
import { AlertCircle, Plus, Search, Users } from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'
import { useClients } from '../hooks/use-clients'
import type { Client } from '../types'
import { ClientModal } from './client-modal'
import { ClientsTable, ClientsTableSkeleton } from './clients-table'

type ClientModalState = { mode: 'create' } | { mode: 'edit'; client: Client }

export function ClientesPage() {
    const { clients, loading, error, load } = useClients()
    const [searchTerm, setSearchTerm] = useState('')
    const [modal, setModal] = useState<ClientModalState | null>(null)

    function handleSearch(e: React.FormEvent) {
        e.preventDefault()
        load(searchTerm)
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Clientes</h1>
                    <p className="text-muted-foreground">Gestiona tu base de clientes</p>
                </div>
                <button
                    onClick={() => setModal({ mode: 'create' })}
                    className="flex items-center gap-2 px-4 py-2.5 bg-brand text-white rounded-xl font-medium hover:bg-brand-hover transition-colors shadow-lg shadow-brand/20 self-start sm:self-auto"
                >
                    <Plus size={20} />
                    Nuevo Cliente
                </button>
            </div>

            {/* Server-side search: submitted on Enter */}
            <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por nombre, DNI, o email..."
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-input bg-card text-foreground focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                />
            </form>

            {error && (
                <div className="p-4 bg-destructive/10 text-destructive rounded-xl flex items-center gap-3">
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}

            {loading ? (
                <ClientsTableSkeleton />
            ) : clients.length === 0 ? (
                <EmptyState icon={Users} message="No se encontraron clientes">
                    {searchTerm && (
                        <button
                            onClick={() => { setSearchTerm(''); load(); }}
                            className="mt-2 text-brand hover:underline"
                        >
                            Limpiar búsqueda
                        </button>
                    )}
                </EmptyState>
            ) : (
                <ClientsTable clients={clients} onEdit={(client) => setModal({ mode: 'edit', client })} />
            )}

            {modal && (
                <ClientModal
                    mode={modal.mode}
                    initialData={modal.mode === 'edit' ? modal.client : null}
                    onClose={() => setModal(null)}
                    onSuccess={() => { setModal(null); load(searchTerm); }}
                />
            )}
        </div>
    )
}
