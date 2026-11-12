export type PersonRef = { id: string; nombre: string };

export type BusinessSettings = {
    id: number | string;
    nombre_negocio: string;
    cuit: string;
    direccion: string;
    telefono: string;
    email: string | null;
    pie_ticket: string;
    /** Maximum discount (% of the subtotal) an employee can apply. */
    descuento_max_empleado: number;
    updated_at: string | null;
    updated_by: PersonRef | null;
};

/** Partial update: only the sent fields change. */
export type BusinessSettingsUpdate = Partial<
    Pick<
        BusinessSettings,
        | 'nombre_negocio'
        | 'cuit'
        | 'direccion'
        | 'telefono'
        | 'email'
        | 'pie_ticket'
        | 'descuento_max_empleado'
    >
>;
