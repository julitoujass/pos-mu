import { Mail, MapPin, Pencil, Phone } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import type { Client } from '../types'

export function ClientsTable({ clients, onEdit }: { clients: Client[]; onEdit: (client: Client) => void }) {
    return (
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
                                        onClick={() => onEdit(client)}
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
    )
}

export function ClientsTableSkeleton() {
    return (
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
    )
}
