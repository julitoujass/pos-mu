'use client'

import { getErrorMessage } from '@/lib/errors'
import { useState, useEffect } from 'react'
import { Plus, Loader2, Edit, Trash2, Bookmark, Tags, AlertCircle } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import {
    fetchMarcas,
    fetchCategorias,
    createMarca,
    updateMarca,
    deleteMarca,
    createCategoria,
    updateCategoria,
    deleteCategoria,
    Marca,
    Categoria
} from '@/lib/api'
import { useCurrentUser } from '@/lib/auth/current-user'

type Tab = 'marcas' | 'categorias'

export default function CatalogosPage() {
    const { isAdmin } = useCurrentUser()
    const [activeTab, setActiveTab] = useState<Tab>('marcas')
    
    // Data
    const [marcas, setMarcas] = useState<Marca[]>([])
    const [categorias, setCategorias] = useState<Categoria[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Modals state
    const [isMarcaModalOpen, setIsMarcaModalOpen] = useState(false)
    const [selectedMarca, setSelectedMarca] = useState<Marca | null>(null)

    const [isCategoriaModalOpen, setIsCategoriaModalOpen] = useState(false)
    const [selectedCategoria, setSelectedCategoria] = useState<Categoria | null>(null)

    // Delete Modal
    const [deleteItem, setDeleteItem] = useState<{ type: Tab, id: number, name: string } | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        try {
            setLoading(true)
            setError(null)
            const [marcasData, categoriasData] = await Promise.all([
                fetchMarcas(),
                fetchCategorias()
            ])
            setMarcas(marcasData)
            setCategorias(categoriasData)
        } catch (err: unknown) {
            setError(getErrorMessage(err, 'Error al cargar catálogos'))
        } finally {
            setLoading(false)
        }
    }

    const openCreateMarca = () => {
        setSelectedMarca(null)
        setIsMarcaModalOpen(true)
    }

    const openEditMarca = (marca: Marca) => {
        setSelectedMarca(marca)
        setIsMarcaModalOpen(true)
    }

    const openCreateCategoria = () => {
        setSelectedCategoria(null)
        setIsCategoriaModalOpen(true)
    }

    const openEditCategoria = (cat: Categoria) => {
        setSelectedCategoria(cat)
        setIsCategoriaModalOpen(true)
    }

    const handleDeleteConfirm = async () => {
        if (!deleteItem) return
        setIsDeleting(true)
        try {
            if (deleteItem.type === 'marcas') {
                await deleteMarca(deleteItem.id)
                setMarcas(marcas.filter(m => m.id !== deleteItem.id))
            } else {
                await deleteCategoria(deleteItem.id)
                setCategorias(categorias.filter(c => c.id !== deleteItem.id))
            }
            toast.success(`${deleteItem.type === 'marcas' ? 'Marca' : 'Categoría'} eliminada exitosamente.`)
            setDeleteItem(null)
        } catch (err: unknown) {
            toast.error(getErrorMessage(err, 'Error al eliminar'))
        } finally {
            setIsDeleting(false)
        }
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-card rounded-3xl border border-destructive/20 mt-10">
                <AlertCircle className="w-12 h-12 text-destructive mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-2">Error al cargar datos</h3>
                <p className="text-muted-foreground mb-6 max-w-md">{error}</p>
                <button
                    onClick={loadData}
                    className="px-6 py-2.5 bg-brand text-white rounded-xl font-medium hover:bg-brand-hover transition-colors"
                >
                    Reintentar
                </button>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Catálogos</h1>
                    <p className="text-muted-foreground mt-1">{isAdmin ? 'Gestiona las marcas y categorías de tu inventario.' : 'Consultá las marcas y categorías del inventario.'}</p>
                </div>
                {isAdmin && (activeTab === 'marcas' ? (
                    <button
                        onClick={openCreateMarca}
                        className="flex items-center gap-2 bg-brand text-white px-5 py-2.5 rounded-xl font-medium hover:bg-brand-hover transition-colors shadow-lg shadow-brand/20"
                    >
                        <Plus size={20} />
                        Nueva Marca
                    </button>
                ) : (
                    <button
                        onClick={openCreateCategoria}
                        className="flex items-center gap-2 bg-brand text-white px-5 py-2.5 rounded-xl font-medium hover:bg-brand-hover transition-colors shadow-lg shadow-brand/20"
                    >
                        <Plus size={20} />
                        Nueva Categoría
                    </button>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex p-1 bg-muted rounded-2xl w-full sm:w-fit">
                <button
                    onClick={() => setActiveTab('marcas')}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all duration-200 ${activeTab === 'marcas'
                        ? 'bg-card text-foreground shadow-sm border border-border'
                        : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    <Bookmark size={18} />
                    Marcas
                </button>
                <button
                    onClick={() => setActiveTab('categorias')}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all duration-200 ${activeTab === 'categorias'
                        ? 'bg-card text-foreground shadow-sm border border-border'
                        : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    <Tags size={18} />
                    Categorías
                </button>
            </div>

            {/* Content Tab */}
            <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm">
                {loading ? (
                    <div className="p-6 space-y-4">
                        {[1, 2, 3].map(i => (
                            <Skeleton key={i} className="h-16 w-full rounded-2xl" />
                        ))}
                    </div>
                ) : activeTab === 'marcas' ? (
                    <div className="divide-y divide-border">
                        {marcas.length === 0 ? (
                            <div className="p-12 text-center text-muted-foreground">No hay marcas registradas.</div>
                        ) : (
                            marcas.map(marca => (
                                <div key={marca.id} className="p-5 flex items-center justify-between hover:bg-muted/50 transition-colors">
                                    <div>
                                        <h3 className="font-bold text-foreground text-lg">{marca.nombre}</h3>
                                        <div className="text-sm text-muted-foreground flex gap-4 mt-1">
                                            {marca.contacto_nombre && <span>👤 {" " + marca.contacto_nombre}</span>}
                                            {marca.telefono && <span>📞 {" " + marca.telefono}</span>}
                                        </div>
                                    </div>
                                    {isAdmin && (
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => openEditMarca(marca)} className="p-2 text-muted-foreground hover:text-brand hover:bg-brand/10 rounded-lg transition-colors">
                                            <Edit size={18} />
                                        </button>
                                        <button onClick={() => setDeleteItem({ type: 'marcas', id: marca.id, name: marca.nombre })} className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {categorias.length === 0 ? (
                            <div className="p-12 text-center text-muted-foreground">No hay categorías registradas.</div>
                        ) : (
                            categorias.map(cat => (
                                <div key={cat.id} className="p-5 flex items-center justify-between hover:bg-muted/50 transition-colors">
                                    <div>
                                        <h3 className="font-bold text-foreground text-lg">{cat.nombre}</h3>
                                        {cat.descripcion && <p className="text-sm text-muted-foreground mt-1">{cat.descripcion}</p>}
                                    </div>
                                    {isAdmin && (
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => openEditCategoria(cat)} className="p-2 text-muted-foreground hover:text-brand hover:bg-brand/10 rounded-lg transition-colors">
                                            <Edit size={18} />
                                        </button>
                                        <button onClick={() => setDeleteItem({ type: 'categorias', id: cat.id, name: cat.nombre })} className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Modals */}
            {isMarcaModalOpen && (
                <MarcaFormModal
                    initialData={selectedMarca}
                    onClose={() => setIsMarcaModalOpen(false)}
                    onSuccess={(saved) => {
                        if (selectedMarca) {
                            setMarcas(marcas.map(m => m.id === saved.id ? saved : m))
                            toast.success('Marca actualizada')
                        } else {
                            setMarcas([...marcas, saved])
                            toast.success('Marca creada')
                        }
                        setIsMarcaModalOpen(false)
                    }}
                />
            )}

            {isCategoriaModalOpen && (
                <CategoriaFormModal
                    initialData={selectedCategoria}
                    onClose={() => setIsCategoriaModalOpen(false)}
                    onSuccess={(saved) => {
                        if (selectedCategoria) {
                            setCategorias(categorias.map(c => c.id === saved.id ? saved : c))
                            toast.success('Categoría actualizada')
                        } else {
                            setCategorias([...categorias, saved])
                            toast.success('Categoría creada')
                        }
                        setIsCategoriaModalOpen(false)
                    }}
                />
            )}

            {deleteItem && (
                <DeleteConfirmModal
                    label={deleteItem.name}
                    loading={isDeleting}
                    onConfirm={handleDeleteConfirm}
                    onCancel={() => setDeleteItem(null)}
                />
            )}
        </div>
    )
}

// ============ FORMS MODALS ============

function MarcaFormModal({ initialData, onClose, onSuccess }: { initialData: Marca | null, onClose: () => void, onSuccess: (m: Marca) => void }) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [form, setForm] = useState<Partial<Marca>>(initialData || { nombre: '', contacto_nombre: '', telefono: '', email: '' })

    const mode = initialData ? 'edit' : 'create'

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.nombre?.trim()) return setError('El nombre es obligatorio')

        setLoading(true)
        setError(null)
        try {
            if (mode === 'edit') {
                const res = await updateMarca(initialData!.id, form)
                onSuccess(res)
            } else {
                const res = await createMarca(form)
                onSuccess(res)
            }
        } catch (err: unknown) {
            setError(getErrorMessage(err, 'Ocurrió un error al guardar'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-card rounded-3xl w-full max-w-md shadow-2xl border border-border flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-border flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-foreground">
                            {mode === 'edit' ? 'Editar Marca' : 'Nueva Marca'}
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">Completa los detalles de la marca.</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center">
                        <Bookmark className="w-6 h-6 text-brand" />
                    </div>
                </div>

                <div className="p-6 overflow-y-auto">
                    <form id="marca-form" onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Nombre *</label>
                            <input
                                type="text"
                                value={form.nombre || ''}
                                onChange={(e) => { setError(null); setForm({ ...form, nombre: e.target.value }) }}
                                className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                                placeholder="Ej: Nike"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Contacto / Vendedor</label>
                            <input
                                type="text"
                                value={form.contacto_nombre || ''}
                                onChange={(e) => setForm({ ...form, contacto_nombre: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Teléfono</label>
                            <input
                                type="text"
                                value={form.telefono || ''}
                                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                            <input
                                type="email"
                                value={form.email || ''}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                            />
                        </div>
                    </form>
                    
                    {error && (
                        <div className="mt-4 flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-sm animate-in fade-in slide-in-from-top-1">
                            <AlertCircle size={16} className="shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-border bg-muted/30 flex gap-3 rounded-b-3xl mt-auto">
                    <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-input bg-card text-foreground font-medium hover:bg-muted transition-colors">
                        Cancelar
                    </button>
                    <button type="submit" form="marca-form" disabled={loading} className="flex-1 py-2.5 rounded-xl bg-brand text-white font-medium hover:bg-brand-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-brand/20">
                        {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                        {mode === 'edit' ? 'Guardar' : 'Crear'}
                    </button>
                </div>
            </div>
        </div>
    )
}

function CategoriaFormModal({ initialData, onClose, onSuccess }: { initialData: Categoria | null, onClose: () => void, onSuccess: (c: Categoria) => void }) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [form, setForm] = useState<Partial<Categoria>>(initialData || { nombre: '', descripcion: '' })

    const mode = initialData ? 'edit' : 'create'

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.nombre?.trim()) return setError('El nombre es obligatorio')

        setLoading(true)
        setError(null)
        try {
            if (mode === 'edit') {
                const res = await updateCategoria(initialData!.id, form)
                onSuccess(res)
            } else {
                const res = await createCategoria(form)
                onSuccess(res)
            }
        } catch (err: unknown) {
            setError(getErrorMessage(err, 'Ocurrió un error al guardar'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-card rounded-3xl w-full max-w-md shadow-2xl border border-border flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-border flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-foreground">
                            {mode === 'edit' ? 'Editar Categoría' : 'Nueva Categoría'}
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">Clasifica tus productos eficientemente.</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center">
                        <Tags className="w-6 h-6 text-brand" />
                    </div>
                </div>

                <div className="p-6 overflow-y-auto">
                    <form id="cat-form" onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Nombre *</label>
                            <input
                                type="text"
                                value={form.nombre || ''}
                                onChange={(e) => { setError(null); setForm({ ...form, nombre: e.target.value }) }}
                                className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                                placeholder="Ej: Remeras"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Descripción</label>
                            <textarea
                                value={form.descripcion || ''}
                                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-brand focus:border-transparent transition-all min-h-[100px] resize-none"
                            />
                        </div>
                    </form>
                    
                    {error && (
                        <div className="mt-4 flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-sm animate-in fade-in slide-in-from-top-1">
                            <AlertCircle size={16} className="shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-border bg-muted/30 flex gap-3 rounded-b-3xl mt-auto">
                    <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-input bg-card text-foreground font-medium hover:bg-muted transition-colors">
                        Cancelar
                    </button>
                    <button type="submit" form="cat-form" disabled={loading} className="flex-1 py-2.5 rounded-xl bg-brand text-white font-medium hover:bg-brand-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-brand/20">
                        {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                        {mode === 'edit' ? 'Guardar' : 'Crear'}
                    </button>
                </div>
            </div>
        </div>
    )
}

function DeleteConfirmModal({ label, loading, onConfirm, onCancel }: { label: string, loading: boolean, onConfirm: () => void, onCancel: () => void }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-card rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-border">
                <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4 mx-auto">
                    <Trash2 className="w-6 h-6 text-destructive" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2 text-center">Confirmar eliminación</h2>
                <p className="text-muted-foreground text-center mb-6 text-sm">
                    ¿Estás seguro de que deseas eliminar <b>{label}</b>? Esta acción no se puede deshacer.
                </p>

                <div className="flex gap-3">
                    <button onClick={onCancel} disabled={loading} className="flex-1 py-2.5 rounded-xl border border-input bg-card text-foreground font-medium hover:bg-muted transition-colors">
                        Cancelar
                    </button>
                    <button onClick={onConfirm} disabled={loading} className="flex-1 py-2.5 rounded-xl bg-destructive text-white font-medium hover:bg-destructive/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        Eliminar
                    </button>
                </div>
            </div>
        </div>
    )
}
