'use client'

import { useAsyncData } from '@/lib/use-async-data'
import { deleteCategoria, deleteMarca, fetchCategorias, fetchMarcas } from '../api'
import type { CatalogTab, Categoria, Marca } from '../types'

const NO_MARCAS: Marca[] = []
const NO_CATEGORIAS: Categoria[] = []

async function loadCatalogos() {
    const [marcas, categorias] = await Promise.all([fetchMarcas(), fetchCategorias()])
    return { marcas, categorias }
}

/** Loads brands and categories and keeps the local lists in sync after each mutation. */
export function useCatalogos() {
    const { data, loading, refreshing, error, reload, setData } = useAsyncData(
        'catalogos',
        loadCatalogos,
        'Error al cargar catálogos',
    )

    /** Replaces the saved brand when it was an edit, appends it otherwise. */
    function applySavedMarca(saved: Marca, wasEdit: boolean) {
        setData(prev => ({
            ...prev,
            marcas: wasEdit ? prev.marcas.map(m => (m.id === saved.id ? saved : m)) : [...prev.marcas, saved],
        }))
    }

    function applySavedCategoria(saved: Categoria, wasEdit: boolean) {
        setData(prev => ({
            ...prev,
            categorias: wasEdit ? prev.categorias.map(c => (c.id === saved.id ? saved : c)) : [...prev.categorias, saved],
        }))
    }

    /** Deletes on the backend and then removes the item locally. Throws on failure. */
    async function remove(type: CatalogTab, id: number) {
        if (type === 'marcas') {
            await deleteMarca(id)
            setData(prev => ({ ...prev, marcas: prev.marcas.filter(m => m.id !== id) }))
        } else {
            await deleteCategoria(id)
            setData(prev => ({ ...prev, categorias: prev.categorias.filter(c => c.id !== id) }))
        }
    }

    return {
        marcas: data?.marcas ?? NO_MARCAS,
        categorias: data?.categorias ?? NO_CATEGORIAS,
        loading,
        refreshing,
        error,
        reload,
        applySavedMarca,
        applySavedCategoria,
        remove,
    }
}
