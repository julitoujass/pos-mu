'use client'

import { useDeferredValue, useEffect, useId, useMemo, useRef, useState } from 'react'
import { Search, UserPlus, X } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import type { Client } from '@/features/clientes'

type ClientSelectorModalProps = {
    clients: Client[]
    onClose: () => void
    onSelect: (id: string) => void
}

/** Client picker with local filtering by name, DNI/CUIT or email. */
export function ClientSelectorModal({ clients, onClose, onSelect }: ClientSelectorModalProps) {
    const titleId = useId()
    const [term, setTerm] = useState('')
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        setTimeout(() => inputRef.current?.focus(), 100)
    }, [])

    // Filter on a deferred copy of the term so typing never stutters with many clients.
    const deferredTerm = useDeferredValue(term)
    const filtered = useMemo(() => {
        const t = deferredTerm.toLowerCase()
        return clients.filter(c =>
            c.nombre.toLowerCase().includes(t) ||
            c.dni_cuit?.includes(t) ||
            c.email?.toLowerCase().includes(t)
        )
    }, [clients, deferredTerm])

    return (
        <Modal
            onClose={onClose}
            labelledBy={titleId}
            backdrop="strong"
            className="bg-card rounded-2xl w-full max-w-lg p-6 shadow-2xl border border-border h-[80vh] flex flex-col"
        >
            <div className="flex justify-between items-center mb-4">
                <h2 id={titleId} className="text-xl font-bold text-foreground flex items-center gap-2">
                    <UserPlus className="text-brand" />
                    Seleccionar Cliente
                </h2>
                <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
                    <X size={20} className="text-muted-foreground" />
                </button>
            </div>

            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <input
                    ref={inputRef}
                    type="text"
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    placeholder="Buscar por nombre, DNI o email..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {filtered.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <p>No se encontraron clientes.</p>
                    </div>
                ) : (
                    filtered.map(client => (
                        <button
                            key={client.id}
                            onClick={() => onSelect(client.id)}
                            className="w-full text-left p-3 rounded-xl hover:bg-muted transition-colors border border-transparent hover:border-border group"
                        >
                            <div className="font-bold text-foreground group-hover:text-brand transition-colors">
                                {client.nombre}
                            </div>
                            <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                                {client.dni_cuit && <span className="bg-muted px-1.5 py-0.5 rounded font-mono">DNI: {client.dni_cuit}</span>}
                                {client.email && <span>{client.email}</span>}
                            </div>
                        </button>
                    ))
                )}
            </div>

            <div className="mt-4 pt-4 border-t border-border text-center">
                <p className="text-xs text-muted-foreground">
                    Mostrando {filtered.length} de {clients.length} clientes
                </p>
            </div>
        </Modal>
    )
}
