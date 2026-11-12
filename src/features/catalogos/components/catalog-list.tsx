import React from 'react'
import { Edit, Trash2 } from 'lucide-react'

type CatalogListProps<T extends { id: number; nombre: string }> = {
    items: T[]
    emptyMessage: string
    /** Only admins see the edit/delete actions. */
    isAdmin: boolean
    /** Secondary line rendered under the item name. */
    renderDetail: (item: T) => React.ReactNode
    onEdit: (item: T) => void
    onDelete: (item: T) => void
}

export function CatalogList<T extends { id: number; nombre: string }>({
    items,
    emptyMessage,
    isAdmin,
    renderDetail,
    onEdit,
    onDelete,
}: CatalogListProps<T>) {
    return (
        <div className="divide-y divide-border">
            {items.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">{emptyMessage}</div>
            ) : (
                items.map(item => (
                    <div key={item.id} className="p-5 flex items-center justify-between hover:bg-muted/50 transition-colors">
                        <div>
                            <h3 className="font-bold text-foreground text-lg">{item.nombre}</h3>
                            {renderDetail(item)}
                        </div>
                        {isAdmin && (
                            <div className="flex items-center gap-2">
                                <button onClick={() => onEdit(item)} className="p-2 text-muted-foreground hover:text-brand hover:bg-brand/10 rounded-lg transition-colors">
                                    <Edit size={18} />
                                </button>
                                <button onClick={() => onDelete(item)} className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    )
}
