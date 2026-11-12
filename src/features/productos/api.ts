import { apiFetch, apiJson } from '@/lib/http';
import type {
    Product,
    ProductCreate,
    ProductUpdate,
    StockAdjust,
    StockMovementsPage,
    Variant,
    VariantCreate,
    VariantUpdate,
} from './types';

// ============ PRODUCTS ============

export function fetchProducts(categoriaId?: number): Promise<Product[]> {
    const path = categoriaId ? `/productos/?categoria_id=${categoriaId}` : '/productos/';
    return apiJson(path, 'Failed to fetch products');
}

export function createProduct(data: ProductCreate): Promise<Product> {
    return apiJson('/productos/', 'Failed to create product', { method: 'POST', body: data });
}

export function updateProduct(id: string, data: ProductUpdate): Promise<Product> {
    return apiJson(`/productos/${id}`, 'Failed to update product', { method: 'PATCH', body: data });
}

export async function deleteProduct(id: string): Promise<void> {
    await apiFetch(`/productos/${id}`, 'Failed to delete product', { method: 'DELETE' });
}

// ============ VARIANTS ============

export function createVariant(data: VariantCreate): Promise<Variant> {
    return apiJson('/productos/variante', 'Failed to create variant', { method: 'POST', body: data });
}

export function updateVariant(id: string, data: VariantUpdate): Promise<Variant> {
    return apiJson(`/productos/variante/${id}`, 'Failed to update variant', { method: 'PATCH', body: data });
}

export async function deleteVariant(id: string): Promise<void> {
    await apiFetch(`/productos/variante/${id}`, 'Failed to delete variant', { method: 'DELETE' });
}

export function adjustStock(data: StockAdjust): Promise<Variant> {
    return apiJson('/productos/inventario/stock', 'Failed to adjust stock', { method: 'PATCH', body: data });
}

/** Admin only: paginated stock ledger (kardex) of a variant. */
export function fetchVariantMovements(
    variantId: string,
    { limit = 50, offset = 0 }: { limit?: number; offset?: number } = {},
): Promise<StockMovementsPage> {
    return apiJson(
        `/productos/variante/${variantId}/movimientos?limit=${limit}&offset=${offset}`,
        'Failed to fetch stock movements',
    );
}
