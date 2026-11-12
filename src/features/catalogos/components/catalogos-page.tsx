'use client'

import { useState } from 'react'
import { AlertCircle, Bookmark, Plus, Tags } from 'lucide-react'
import { toast } from 'sonner'
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useCurrentUser } from '@/features/auth'
import { getErrorMessage } from '@/lib/errors'
import { useCatalogos } from '../hooks/use-catalogos'
import type { CatalogTab, Categoria, Marca } from '../types'
import { CatalogList } from './catalog-list'
import { CategoriaFormModal } from './categoria-form-modal'
import { MarcaFormModal } from './marca-form-modal'

const TABS: { id: CatalogTab; label: string; icon: typeof Bookmark }[] = [
    { id: 'marcas', label: 'Marcas', icon: Bookmark },
    { id: 'categorias', label: 'Categorías', icon: Tags },
]

/** `item` is the entry being edited; null means "create". */
type FormModalState =
    | { type: 'marcas'; item: Marca | null }
    | { type: 'categorias'; item: Categoria | null }

export function CatalogosPage() {
    const { isAdmin } = useCurrentUser()
    const { marcas, categorias, loading, error, reload, applySavedMarca, applySavedCategoria, remove } = useCatalogos()
    const [activeTab, setActiveTab] = useState<CatalogTab>('marcas')
    const [formModal, setFormModal] = useState<FormModalState | null>(null)
    const [deleteItem, setDeleteItem] = useState<{ type: CatalogTab, id: number, name: string } | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDeleteConfirm = async () => {
        if (!deleteItem) return
        setIsDeleting(true)
        try {
            await remove(deleteItem.type, deleteItem.id)
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
                    onClick={reload}
                    className="px-6 py-2.5 bg-brand text-white rounded-xl font-medium hover:bg-brand-hover transition-colors"
                >
                    Reintentar
                </button>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Catálogos</h1>
                    <p className="text-muted-foreground mt-1">{isAdmin ? 'Gestiona las marcas y categorías de tu inventario.' : 'Consultá las marcas y categorías del inventario.'}</p>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => setFormModal({ type: activeTab, item: null })}
                        className="flex items-center gap-2 bg-brand text-white px-5 py-2.5 rounded-xl font-medium hover:bg-brand-hover transition-colors shadow-lg shadow-brand/20"
                    >
                        <Plus size={20} />
                        {activeTab === 'marcas' ? 'Nueva Marca' : 'Nueva Categoría'}
                    </button>
                )}
            </div>

            <div className="flex p-1 bg-muted rounded-2xl w-full sm:w-fit">
                {TABS.map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        onClick={() => setActiveTab(id)}
                        className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all duration-200 ${activeTab === id
                            ? 'bg-card text-foreground shadow-sm border border-border'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <Icon size={18} />
                        {label}
                    </button>
                ))}
            </div>

            <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm">
                {loading ? (
                    <div className="p-6 space-y-4">
                        {[1, 2, 3].map(i => (
                            <Skeleton key={i} className="h-16 w-full rounded-2xl" />
                        ))}
                    </div>
                ) : activeTab === 'marcas' ? (
                    <CatalogList
                        items={marcas}
                        emptyMessage="No hay marcas registradas."
                        isAdmin={isAdmin}
                        renderDetail={(marca) => (
                            <div className="text-sm text-muted-foreground flex gap-4 mt-1">
                                {marca.contacto_nombre && <span>👤 {" " + marca.contacto_nombre}</span>}
                                {marca.telefono && <span>📞 {" " + marca.telefono}</span>}
                            </div>
                        )}
                        onEdit={(marca) => setFormModal({ type: 'marcas', item: marca })}
                        onDelete={(marca) => setDeleteItem({ type: 'marcas', id: marca.id, name: marca.nombre })}
                    />
                ) : (
                    <CatalogList
                        items={categorias}
                        emptyMessage="No hay categorías registradas."
                        isAdmin={isAdmin}
                        renderDetail={(cat) => cat.descripcion && <p className="text-sm text-muted-foreground mt-1">{cat.descripcion}</p>}
                        onEdit={(cat) => setFormModal({ type: 'categorias', item: cat })}
                        onDelete={(cat) => setDeleteItem({ type: 'categorias', id: cat.id, name: cat.nombre })}
                    />
                )}
            </div>

            {formModal?.type === 'marcas' && (
                <MarcaFormModal
                    initialData={formModal.item}
                    onClose={() => setFormModal(null)}
                    onSuccess={(saved) => {
                        const wasEdit = formModal.item !== null
                        applySavedMarca(saved, wasEdit)
                        toast.success(wasEdit ? 'Marca actualizada' : 'Marca creada')
                        setFormModal(null)
                    }}
                />
            )}

            {formModal?.type === 'categorias' && (
                <CategoriaFormModal
                    initialData={formModal.item}
                    onClose={() => setFormModal(null)}
                    onSuccess={(saved) => {
                        const wasEdit = formModal.item !== null
                        applySavedCategoria(saved, wasEdit)
                        toast.success(wasEdit ? 'Categoría actualizada' : 'Categoría creada')
                        setFormModal(null)
                    }}
                />
            )}

            {deleteItem && (
                <DeleteConfirmDialog
                    label={deleteItem.name}
                    loading={isDeleting}
                    onConfirm={handleDeleteConfirm}
                    onCancel={() => setDeleteItem(null)}
                />
            )}
        </div>
    )
}
