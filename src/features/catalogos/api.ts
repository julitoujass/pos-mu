import { apiFetch, apiJson } from '@/lib/http';
import type { Categoria, Marca } from './types';

// ============ MARCAS ============

export function fetchMarcas(): Promise<Marca[]> {
    return apiJson('/catalogos/marcas', 'Error al cargar marcas');
}

export function createMarca(data: Partial<Marca>): Promise<Marca> {
    return apiJson('/catalogos/marcas', 'Error al crear marca', { method: 'POST', body: data });
}

export function updateMarca(id: number, data: Partial<Marca>): Promise<Marca> {
    return apiJson(`/catalogos/marcas/${id}`, 'Error al actualizar marca', { method: 'PATCH', body: data });
}

export async function deleteMarca(id: number): Promise<void> {
    await apiFetch(`/catalogos/marcas/${id}`, 'Error al eliminar marca', { method: 'DELETE' });
}

// ============ CATEGORIAS ============

export function fetchCategorias(): Promise<Categoria[]> {
    return apiJson('/catalogos/categorias', 'Error al cargar categorias');
}

export function createCategoria(data: Partial<Categoria>): Promise<Categoria> {
    return apiJson('/catalogos/categorias', 'Error al crear categoría', { method: 'POST', body: data });
}

export function updateCategoria(id: number, data: Partial<Categoria>): Promise<Categoria> {
    return apiJson(`/catalogos/categorias/${id}`, 'Error al actualizar categoría', { method: 'PATCH', body: data });
}

export async function deleteCategoria(id: number): Promise<void> {
    await apiFetch(`/catalogos/categorias/${id}`, 'Error al eliminar categoría', { method: 'DELETE' });
}
