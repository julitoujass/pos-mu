export type AuditEntry = {
    id: string | number;
    created_at: string;
    evento: string;
    entidad: string;
    entidad_id: string | null;
    descripcion: string | null;
    estado: string;
    payload_enviado: unknown;
    respuesta_recibida: unknown;
    usuario: { id: string; nombre: string } | null;
};

export type AuditPage = { items: AuditEntry[]; total: number };

export type AuditFilters = {
    /** YYYY-MM-DD */
    desde?: string;
    /** YYYY-MM-DD */
    hasta?: string;
    evento?: string;
    entidad?: string;
    usuario_id?: string;
    limit?: number;
    offset?: number;
};
