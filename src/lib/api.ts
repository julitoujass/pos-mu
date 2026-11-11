import { createClient as createSupabaseClient } from './supabase/client';
import { ApiError, getApiErrorDetail } from './errors';

export { ApiError };

// Use Next.js rewrite proxy to avoid CORS
const API_URL = '/api/python';

async function getAuthHeaders(): Promise<HeadersInit> {
    const supabase = createSupabaseClient();
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
        console.error('Error getting session:', error);
    }

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
    } else if (process.env.NODE_ENV !== 'production') {
        console.warn('[API] No access token available for request');
    }

    return headers;
}

/**
 * Builds an ApiError from a failed response, using the backend `detail`
 * (403, 409, 422...) when present and `fallback` otherwise.
 */
async function toApiError(res: Response, fallback: string): Promise<ApiError> {
    const body: unknown = await res.json().catch(() => ({}));
    return new ApiError(getApiErrorDetail(body, fallback), res.status);
}

// ============ TYPES ============

export type Marca = {
    id: number;
    nombre: string;
    contacto_nombre?: string | null;
    telefono?: string | null;
    email?: string | null;
    created_at?: string | null;
};

export type Categoria = {
    id: number;
    nombre: string;
    descripcion?: string | null;
    tiendanube_id?: string | null;
    created_at?: string | null;
};

export type Product = {
    id: string;
    nombre: string;
    descripcion?: string | null;
    marca_id?: number | null;
    created_at?: string | null;
    variantes: Variant[];
};

export type ProductCreate = {
    nombre: string;
    descripcion?: string | null;
    marca_id?: number | null;
};

export type ProductUpdate = {
    nombre?: string | null;
    descripcion?: string | null;
    marca_id?: number | null;
};

export type Variant = {
    id: string;
    sku?: string | null;
    talle?: string | null;
    color?: string | null;
    precio_venta: number;
    stock_actual: number;
    producto_id: string;
    /** null for empleado: the backend hides costs from non-admins */
    precio_costo?: number | null;
    stock_minimo?: number;
};

export type VariantCreate = {
    producto_id: string;
    sku?: string | null;
    talle?: string | null;
    color?: string | null;
    precio_venta: number;
    stock_actual?: number;
    stock_minimo?: number;
    precio_costo?: number;
};

export type VariantUpdate = {
    sku?: string | null;
    talle?: string | null;
    color?: string | null;
    precio_venta?: number | null;
    precio_costo?: number | null;
    stock_minimo?: number | null;
};

export type SaleResponse = {
    id: string;
    total: number;
    metodo_pago: string;
    created_at: string;
};

export type CashStatusResponse = {
    id: string;
    estado: string;
    monto_apertura: number;
    fecha_apertura: string;
    fecha_cierre?: string | null;
    monto_real_efectivo?: number | null;
    monto_esperado_efectivo?: number | null;
    observaciones?: string | null;
    usuario_id?: string;
};

export type CashSummary = {
    sesion_id: string;
    estado: string;
    fecha_apertura: string;
    monto_apertura: number;
    ventas_efectivo: number;
    ventas_tarjeta: number;
    ventas_qr: number;
    cantidad_ventas: number;
    ingresos: number;
    egresos: number;
    /** Authoritative expected cash: apertura + cash sales of this session + ingresos - egresos */
    esperado_efectivo: number;
};

export type CashOpen = {
    monto_apertura: number;
};

export type CashClose = {
    monto_real_efectivo: number;
    observaciones?: string;
};

export type CashMovement = {
    id: string;
    sesion_id?: string;
    caja_id?: string;
    tipo: 'ingreso' | 'egreso';
    monto: number;
    motivo?: string;
    descripcion?: string;
    created_at: string;
    usuario_id?: string;
};

export type CashMovementCreate = {
    tipo: 'ingreso' | 'egreso';
    monto: number;
    motivo: string;
};

// ============ REPORTE TYPES ============

export type VentaDia = {
    fecha: string;
    total: number;
    cantidad_ventas: number;
};

export type VentasTotalesReporte = {
    total_ingresos: number;
    cantidad_operaciones: number;
    ventas_por_dia: VentaDia[];
};

export type ProductoTopReporte = {
    variante_id: string;
    nombre_producto: string;
    talle?: string | null;
    color?: string | null;
    cantidad_vendida: number;
    ingresos_generados: number;
};

export type CajaResumenDiario = {
    fecha: string;
    sesiones_abiertas: number;
    monto_inicial_total: number;
    ingresos: number;
    egresos: number;
    monto_real_efectivo_total: number;
    diferencia_esperado_vs_real: number;
};

export type CajaResumenReporte = {
    resumen_diario: CajaResumenDiario[];
    diferencia_total_periodo: number;
};

// ============ SALES ============

export async function fetchSalesToday(): Promise<SaleResponse[]> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/ventas/hoy`, {
        headers,
        cache: 'no-store'
    });
    if (!res.ok) throw await toApiError(res, 'Failed to fetch sales');
    return res.json();
}

// ============ CASH ============

export async function fetchCashStatus(): Promise<CashStatusResponse | null> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/caja/estado`, {
        headers,
        cache: 'no-store'
    });
    if (!res.ok) throw await toApiError(res, 'Failed to fetch cash status');
    return res.json();
}

export async function fetchCashSummary(): Promise<CashSummary | null> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/caja/resumen`, {
        headers,
        cache: 'no-store'
    });
    if (!res.ok) {
        throw await toApiError(res, 'Failed to fetch cash summary');
    }
    return res.json();
}

export async function openRegister(data: CashOpen): Promise<CashStatusResponse> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/caja/apertura`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ monto_apertura: data.monto_apertura }),
    });
    if (!res.ok) {
        throw await toApiError(res, 'Error opening register');
    }
    return res.json();
}

export async function closeRegister(data: CashClose): Promise<CashStatusResponse> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/caja/cierre`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        throw await toApiError(res, 'Error closing register');
    }
    return res.json();
}

export async function fetchCashMovements(): Promise<CashMovement[]> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/caja/movimientos`, {
        headers,
        cache: 'no-store'
    });
    if (!res.ok) throw await toApiError(res, 'Failed to fetch movements');
    return res.json();
}

export async function fetchCashSessions(): Promise<CashStatusResponse[]> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/caja/sesiones`, {
        headers,
        cache: 'no-store'
    });
    if (!res.ok) throw await toApiError(res, 'Failed to fetch cash sessions');
    return res.json();
}

export async function fetchSessionMovements(sesionId: string): Promise<CashMovement[]> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/caja/sesiones/${sesionId}/movimientos`, {
        headers,
        cache: 'no-store'
    });
    if (!res.ok) throw await toApiError(res, 'Failed to fetch session movements');
    return res.json();
}

export async function createCashMovement(data: CashMovementCreate): Promise<CashMovement> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/caja/movimiento`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        throw await toApiError(res, 'Error creating movement');
    }
    return res.json();
}

// ============ PRODUCTS ============

export async function fetchProducts(categoriaId?: number): Promise<Product[]> {
    const headers = await getAuthHeaders();
    const url = categoriaId
        ? `${API_URL}/productos/?categoria_id=${categoriaId}`
        : `${API_URL}/productos/`;

    const res = await fetch(url, {
        headers,
        cache: 'no-store'
    });

    if (!res.ok) {
        throw await toApiError(res, 'Failed to fetch products');
    }
    return res.json();
}

export async function createProduct(data: ProductCreate): Promise<Product> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/productos/`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        throw await toApiError(res, 'Failed to create product');
    }
    return res.json();
}

export async function updateProduct(id: string, data: ProductUpdate): Promise<Product> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/productos/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        throw await toApiError(res, 'Failed to update product');
    }
    return res.json();
}

// ============ VARIANTS ============

export async function createVariant(data: VariantCreate): Promise<Variant> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/productos/variante`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        throw await toApiError(res, 'Failed to create variant');
    }
    return res.json();
}

export async function updateVariant(id: string, data: VariantUpdate): Promise<Variant> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/productos/variante/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        throw await toApiError(res, 'Failed to update variant');
    }
    return res.json();
}

export type StockAdjust = {
    variante_id: string;
    /** Positivo para ingresar stock, negativo para descontar */
    cantidad: number;
    motivo: string;
};

export async function adjustStock(data: StockAdjust): Promise<Variant> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/productos/inventario/stock`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        throw await toApiError(res, 'Failed to adjust stock');
    }
    return res.json();
}

export async function deleteVariant(id: string): Promise<void> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/productos/variante/${id}`, {
        method: 'DELETE',
        headers,
    });

    if (!res.ok) {
        throw await toApiError(res, 'Failed to delete variant');
    }
}

export async function deleteProduct(id: string): Promise<void> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/productos/${id}`, {
        method: 'DELETE',
        headers,
    });

    if (!res.ok) {
        throw await toApiError(res, 'Failed to delete product');
    }
}


// ============ CUSTOMERS ============

export type Client = {
    id: string;
    nombre: string;
    dni_cuit?: string | null;
    email?: string | null;
    telefono?: string | null;
    direccion?: string | null;
    ciudad?: string | null;
    tipo_iva?: string | null;
    created_at: string;
};

export type ClientCreate = {
    nombre: string;
    dni_cuit?: string | null;
    email?: string | null;
    telefono?: string | null;
    direccion?: string | null;
    ciudad?: string | null;
    tipo_iva?: string | null;
};

export type ClientUpdate = {
    nombre?: string | null;
    dni_cuit?: string | null;
    email?: string | null;
    telefono?: string | null;
    direccion?: string | null;
    ciudad?: string | null;
    tipo_iva?: string | null;
};

export async function fetchClients(query?: string): Promise<Client[]> {
    const headers = await getAuthHeaders();
    const url = query
        ? `${API_URL}/clientes/?query=${encodeURIComponent(query)}`
        : `${API_URL}/clientes/`;

    const res = await fetch(url, {
        headers,
        cache: 'no-store'
    });

    if (!res.ok) {
        throw await toApiError(res, 'Failed to fetch clients');
    }
    return res.json();
}

export async function createClient(data: ClientCreate): Promise<Client> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/clientes/`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        throw await toApiError(res, 'Failed to create client');
    }
    return res.json();
}

export async function updateClient(id: string, data: ClientUpdate): Promise<Client> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/clientes/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        throw await toApiError(res, 'Failed to update client');
    }
    return res.json();
}

// ============ NEW SALE (POS) ============

export type PaymentMethod = 'Efectivo' | 'Tarjeta' | 'QR';

export type SaleItemCreate = {
    variante_id: string;
    cantidad: number;
};

// Prices and total are NOT sent: the backend takes them from the database.
export type SaleCreate = {
    cliente_id?: string | null;
    metodo_pago: PaymentMethod;
    items: SaleItemCreate[];
};

/**
 * Registers a sale. `idempotencyKey` makes retries safe: the same key
 * returns the same sale instead of creating a duplicate.
 */
export async function processSale(data: SaleCreate, idempotencyKey: string): Promise<SaleResponse> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/ventas/`, {
        method: 'POST',
        headers: { ...headers, 'Idempotency-Key': idempotencyKey },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        throw await toApiError(res, 'Failed to process sale');
    }
    return res.json();
}

// ============ REPORTES ============

export async function fetchReporteVentas(fechaInicio?: string, fechaFin?: string): Promise<VentasTotalesReporte> {
    const headers = await getAuthHeaders();

    const params = new URLSearchParams();
    if (fechaInicio) params.append('fecha_inicio', fechaInicio);
    if (fechaFin) params.append('fecha_fin', fechaFin);

    const queryStr = params.toString() ? `?${params.toString()}` : '';

    const res = await fetch(`${API_URL}/reportes/ventas${queryStr}`, {
        headers,
        cache: 'no-store'
    });

    if (!res.ok) {
        throw await toApiError(res, 'Failed to fetch sales report');
    }
    return res.json();
}

export async function fetchReporteProductosTop(fechaInicio?: string, fechaFin?: string): Promise<ProductoTopReporte[]> {
    const headers = await getAuthHeaders();

    const params = new URLSearchParams();
    if (fechaInicio) params.append('fecha_inicio', fechaInicio);
    if (fechaFin) params.append('fecha_fin', fechaFin);

    const queryStr = params.toString() ? `?${params.toString()}` : '';

    const res = await fetch(`${API_URL}/reportes/productos-top${queryStr}`, {
        headers,
        cache: 'no-store'
    });

    if (!res.ok) {
        throw await toApiError(res, 'Failed to fetch top products report');
    }
    return res.json();
}

export async function fetchReporteCajas(fechaInicio?: string, fechaFin?: string): Promise<CajaResumenReporte> {
    const headers = await getAuthHeaders();

    const params = new URLSearchParams();
    if (fechaInicio) params.append('fecha_inicio', fechaInicio);
    if (fechaFin) params.append('fecha_fin', fechaFin);

    const queryStr = params.toString() ? `?${params.toString()}` : '';

    const res = await fetch(`${API_URL}/reportes/cajas${queryStr}`, {
        headers,
        cache: 'no-store'
    });

    if (!res.ok) {
        throw await toApiError(res, 'Failed to fetch cash report');
    }
    return res.json();
}

// ============ CATALOGOS (MARCAS Y CATEGORIAS) ============

export async function fetchMarcas(): Promise<Marca[]> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/catalogos/marcas`, { headers, cache: 'no-store' });
    if (!res.ok) throw await toApiError(res, 'Error al cargar marcas');
    return res.json();
}

export async function createMarca(data: Partial<Marca>): Promise<Marca> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/catalogos/marcas`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        throw await toApiError(res, 'Error al crear marca');
    }
    return res.json();
}

export async function updateMarca(id: number, data: Partial<Marca>): Promise<Marca> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/catalogos/marcas/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        throw await toApiError(res, 'Error al actualizar marca');
    }
    return res.json();
}

export async function deleteMarca(id: number): Promise<void> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/catalogos/marcas/${id}`, {
        method: 'DELETE',
        headers,
    });
    if (!res.ok) {
        throw await toApiError(res, 'Error al eliminar marca');
    }
}

export async function fetchCategorias(): Promise<Categoria[]> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/catalogos/categorias`, { headers, cache: 'no-store' });
    if (!res.ok) throw await toApiError(res, 'Error al cargar categorias');
    return res.json();
}

export async function createCategoria(data: Partial<Categoria>): Promise<Categoria> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/catalogos/categorias`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        throw await toApiError(res, 'Error al crear categoría');
    }
    return res.json();
}

export async function updateCategoria(id: number, data: Partial<Categoria>): Promise<Categoria> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/catalogos/categorias/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        throw await toApiError(res, 'Error al actualizar categoría');
    }
    return res.json();
}

export async function deleteCategoria(id: number): Promise<void> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/catalogos/categorias/${id}`, {
        method: 'DELETE',
        headers,
    });
    if (!res.ok) {
        throw await toApiError(res, 'Error al eliminar categoría');
    }
}

// ============ USERS & ROLES ============

export type RoleResponse = {
    id: number;
    nombre: string;
};

export type UsuarioResponse = {
    id: string;
    nombre: string;
    apellido?: string | null;
    activo: boolean;
    roles?: RoleResponse | null;
    created_at: string;
};

export type MeResponse = {
    id: string;
    email: string;
    rol: string;
    activo?: boolean;
};

export async function fetchMe(): Promise<MeResponse> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/usuarios/me`, {
        headers,
        cache: 'no-store'
    });
    if (!res.ok) throw await toApiError(res, 'Failed to fetch user profile');
    return res.json();
}

export async function fetchUsers(): Promise<UsuarioResponse[]> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/usuarios/`, {
        headers,
        cache: 'no-store'
    });
    if (!res.ok) {
        throw await toApiError(res, 'Failed to fetch users');
    }
    return res.json();
}

export async function fetchRoles(): Promise<RoleResponse[]> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/usuarios/roles`, {
        headers,
        cache: 'no-store'
    });
    if (!res.ok) throw await toApiError(res, 'Failed to fetch roles');
    return res.json();
}

export async function updateUserRole(id: string, rol_id: number): Promise<UsuarioResponse> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/usuarios/${id}/rol`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ rol_id })
    });
    if (!res.ok) {
        throw await toApiError(res, 'Failed to update user role');
    }
    return res.json();
}

export async function updateUserActive(id: string, activo: boolean): Promise<UsuarioResponse> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/usuarios/${id}/activo`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ activo })
    });
    if (!res.ok) throw await toApiError(res, 'Failed to update user status');
    return res.json();
}
