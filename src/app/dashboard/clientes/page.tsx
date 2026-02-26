'use client'

import { useState, useEffect } from 'react'
import { Users, Plus, Search, Loader2, AlertCircle, Pencil, Mail, Phone, MapPin } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import {
    fetchClients,
    createClient,
    updateClient,
    Client,
    ClientCreate,
    ClientUpdate
} from '@/lib/api'

export default function ClientsPage() {
    const [clients, setClients] = useState<Client[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')

    // Modal states
    const [showModal, setShowModal] = useState(false)
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
    const [editingClient, setEditingClient] = useState<Client | null>(null)

    async function loadClients(query?: string) {
        try {
            setLoading(true)
            const data = await fetchClients(query)
            setClients(data)
        } catch (err: any) {
            setError(err.message || 'Error al cargar clientes')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadClients()
    }, [])

    function handleSearch(e: React.FormEvent) {
        e.preventDefault()
        loadClients(searchTerm)
    }

    function handleOpenCreate() {
        setModalMode('create')
        setEditingClient(null)
        setShowModal(true)
    }

    function handleOpenEdit(client: Client) {
        setModalMode('edit')
        setEditingClient(client)
        setShowModal(true)
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Clientes</h1>
                    <p className="text-muted-foreground">Gestiona tu base de clientes</p>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="flex items-center gap-2 px-4 py-2.5 bg-brand text-white rounded-xl font-medium hover:bg-brand-hover transition-colors shadow-lg shadow-brand/20 self-start sm:self-auto"
                >
                    <Plus size={20} />
                    Nuevo Cliente
                </button>
            </div>

            {/* Search Bar */}
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
                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                    <div className="p-4 border-b border-border bg-muted/30 flex gap-4">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-6 w-32" />
                    </div>
                    <div>
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="p-4 flex justify-between border-b border-border last:border-0 hover:bg-muted/30">
                                <div className="space-y-2">
                                    <Skeleton className="h-5 w-40" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                                <div className="space-y-2 hidden sm:block">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-4 w-32" />
                                </div>
                                <Skeleton className="h-8 w-8 rounded-lg" />
                            </div>
                        ))}
                    </div>
                </div>
            ) : clients.length === 0 ? (
                <div className="text-center py-12 bg-card rounded-2xl border border-border">
                    <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No se encontraron clientes</p>
                    {searchTerm && (
                        <button
                            onClick={() => { setSearchTerm(''); loadClients(); }}
                            className="mt-2 text-brand hover:underline"
                        >
                            Limpiar búsqueda
                        </button>
                    )}
                </div>
            ) : (
                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-muted text-muted-foreground font-medium">
                                <tr>
                                    <th className="p-4">Cliente</th>
                                    <th className="p-4">Contacto</th>
                                    <th className="p-4">Ubicación</th>
                                    <th className="p-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {clients.map((client) => (
                                    <tr key={client.id} className="hover:bg-muted/50 transition-colors">
                                        <td className="p-4">
                                            <div className="font-semibold text-foreground">{client.nombre}</div>
                                            {client.dni_cuit && (
                                                <div className="text-sm text-muted-foreground font-mono">{client.dni_cuit}</div>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="space-y-1">
                                                {client.email && (
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Mail size={14} className="text-muted-foreground/70" />
                                                        {client.email}
                                                    </div>
                                                )}
                                                {client.telefono && (
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Phone size={14} className="text-muted-foreground/70" />
                                                        {client.telefono}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                {(client.direccion || client.ciudad) ? (
                                                    <>
                                                        <MapPin size={14} className="text-muted-foreground/70" />
                                                        <span>
                                                            {[client.direccion, client.ciudad].filter(Boolean).join(', ')}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className="text-muted-foreground/50 italic">No especificada</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => handleOpenEdit(client)}
                                                className="p-2 text-muted-foreground hover:text-brand hover:bg-brand/10 rounded-lg transition-colors"
                                                title="Editar"
                                            >
                                                <Pencil size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {showModal && (
                <ClientModal
                    mode={modalMode}
                    initialData={editingClient}
                    onClose={() => setShowModal(false)}
                    onSuccess={() => { setShowModal(false); loadClients(searchTerm); }}
                />
            )}
        </div>
    )
}

// ============ CLIENT MODAL ============

interface ClientModalProps {
    mode: 'create' | 'edit'
    initialData?: Client | null
    onClose: () => void
    onSuccess: () => void
}

function ClientModal({ mode, initialData, onClose, onSuccess }: ClientModalProps) {
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState<ClientCreate>({
        nombre: initialData?.nombre || '',
        dni_cuit: initialData?.dni_cuit || '',
        email: initialData?.email || '',
        telefono: initialData?.telefono || '',
        direccion: initialData?.direccion || '',
        ciudad: initialData?.ciudad || '',
        tipo_iva: initialData?.tipo_iva || 'Consumidor Final'
    })

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        try {
            const dataToSubmit = {
                ...form,
                dni_cuit: form.dni_cuit || null,
                email: form.email || null,
                telefono: form.telefono || null,
                direccion: form.direccion || null,
                ciudad: form.ciudad || null
            }

            if (mode === 'edit' && initialData) {
                await updateClient(initialData.id, dataToSubmit)
            } else {
                await createClient(dataToSubmit)
            }
            onSuccess()
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-card rounded-2xl w-full max-w-2xl p-6 shadow-2xl border border-border max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold text-foreground mb-6">
                    {mode === 'edit' ? 'Editar Cliente' : 'Nuevo Cliente'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-foreground mb-1">Nombre Completo *</label>
                            <input
                                type="text"
                                required
                                value={form.nombre}
                                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                                className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                                placeholder="Juan Pérez"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">DNI / CUIT</label>
                            <input
                                type="text"
                                value={form.dni_cuit || ''}
                                onChange={(e) => setForm({ ...form, dni_cuit: e.target.value })}
                                className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                                placeholder="12345678"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Condición IVA</label>
                            <select
                                value={form.tipo_iva || 'Consumidor Final'}
                                onChange={(e) => setForm({ ...form, tipo_iva: e.target.value })}
                                className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                            >
                                <option value="Consumidor Final">Consumidor Final</option>
                                <option value="Monotributista">Monotributista</option>
                                <option value="Responsable Inscripto">Responsable Inscripto</option>
                                <option value="Exento">Exento</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                            <input
                                type="email"
                                value={form.email || ''}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                                placeholder="juan@ejemplo.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Teléfono</label>
                            <input
                                type="tel"
                                value={form.telefono || ''}
                                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                                className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                                placeholder="+54 9 11 ..."
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-foreground mb-1">Dirección</label>
                            <input
                                type="text"
                                value={form.direccion || ''}
                                onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                                className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                                placeholder="Calle Falsa 123"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Ciudad</label>
                            <input
                                type="text"
                                value={form.ciudad || ''}
                                onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
                                className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                                placeholder="Buenos Aires"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-border mt-4">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-input text-muted-foreground font-medium hover:bg-muted hover:text-foreground transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl bg-brand text-white font-medium hover:bg-brand-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (mode === 'edit' ? 'Guardar' : 'Crear')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
