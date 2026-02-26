import { createClient as createSupabaseClient } from './supabase/client';

// Use Next.js rewrite proxy to avoid CORS
const API_URL = '/api/python';

async function getAuthHeaders(): Promise<HeadersInit> {
    const supabase = createSupabaseClient();
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
        console.error('Error getting session:', error);
    }

    console.log('Session status:', session ? 'Active' : 'None', 'User:', session?.user?.email);

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    if (session?.access_token) {
        console.log('Adding Bearer token to headers');
        headers['Authorization'] = `Bearer ${session.access_token}`;
    } else {
        console.warn('No access token available for API request');
    }

    return headers;
}

// ============ TYPES ============

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
    precio_costo?: number;
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
    monto_real_efectivo?: number;
};

export type CashOpen = {
    monto_apertura: number;
    usuario_id: string;
};

export type CashClose = {
    monto_real_efectivo: number;
    observaciones?: string;
};

export type CashMovement = {
    id: string;
    caja_id: string;
    tipo: 'ingreso' | 'egreso';
    monto: number;
    descripcion: string;
    created_at: string;
    usuario_id?: string;
};

export type CashMovementCreate = {
    tipo: 'ingreso' | 'egreso';
    monto: number;
    descripcion: string;
};

// ============ SALES ============

export async function fetchSalesToday(): Promise<SaleResponse[]> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/ventas/hoy`, {
        headers,
        cache: 'no-store'
    });
    if (!res.ok) throw new Error('Failed to fetch sales');
    return res.json();
}

// ============ CASH ============

export async function fetchCashStatus(): Promise<CashStatusResponse | null> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/caja/estado`, {
        headers,
        cache: 'no-store'
    });
    if (!res.ok) throw new Error('Failed to fetch cash status');
    return res.json();
}

export async function openRegister(data: Omit<CashOpen, 'usuario_id'>): Promise<CashStatusResponse> {
    const headers = await getAuthHeaders();

    // We get the user from the supabase client to inject the ID
    const supabase = createSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Usuario no autenticado');

    const payload: CashOpen = {
        ...data,
        usuario_id: user.id
    };

    const res = await fetch(`${API_URL}/caja/apertura`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.detail || 'Error opening register');
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
        const error = await res.json().catch(() => ({}));
        throw new Error(error.detail || 'Error closing register');
    }
    return res.json();
}

export async function fetchCashMovements(): Promise<CashMovement[]> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/caja/movimientos`, {
        headers,
        cache: 'no-store'
    });
    if (!res.ok) throw new Error('Failed to fetch movements');
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
        const error = await res.json().catch(() => ({}));
        throw new Error(error.detail || 'Error creating movement');
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
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to fetch products');
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
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to create product');
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
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to update product');
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
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to create variant');
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
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to update variant');
    }
    return res.json();
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
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to fetch clients');
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
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to create client');
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
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to update client');
    }
    return res.json();
}

// ============ NEW SALE (POS) ============

export type SaleItemCreate = {
    variante_id: string;
    cantidad: number;
    precio_unitario: number;
};

export type SaleCreate = {
    cliente_id?: string | null;
    metodo_pago: string;
    items: SaleItemCreate[];
    total: number; // Backend might recalculate, but passing it for validation or logging is often useful
};

export async function processSale(data: SaleCreate): Promise<SaleResponse> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/ventas/`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to process sale');
    }
    return res.json();
}
