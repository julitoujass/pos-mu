'use client'

import { useEffect, useState } from 'react'
import { getErrorMessage } from '@/lib/errors'
import { deleteCategoria, deleteMarca, fetchCategorias, fetchMarcas } from '../api'
import type { CatalogTab, Categoria, Marca } from '../types'

/** Loads brands and categories and keeps the local lists in sync after each mutation. */
export function useCatalogos() {
    const [marcas, setMarcas] = useState<Marca[]>([])
    const [categorias, setCategorias] = useState<Categoria[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        reload()
    }, [])

    async function reload() {
        try {
            setLoading(true)
            setError(null)
            const [marcasData, categoriasData] = await Promise.all([
                fetchMarcas(),
                fetchCategorias()
            ])
            setMarcas(marcasData)
            setCategorias(categoriasData)
        } catch (err: unknown) {
            setError(getErrorMessage(err, 'Error al cargar catálogos'))
        } finally {
            setLoading(false)
        }
    }

    /** Replaces the saved brand when it was an edit, appends it otherwise. */
    function applySavedMarca(saved: Marca, wasEdit: boolean) {
        setMarcas(wasEdit ? marcas.map(m => m.id === saved.id ? saved : m) : [...marcas, saved])
    }

    function applySavedCategoria(saved: Categoria, wasEdit: boolean) {
        setCategorias(wasEdit ? categorias.map(c => c.id === saved.id ? saved : c) : [...categorias, saved])
    }

    /** Deletes on the backend and then removes the item locally. Throws on failure. */
    async function remove(type: CatalogTab, id: number) {
        if (type === 'marcas') {
            await deleteMarca(id)
            setMarcas(marcas.filter(m => m.id !== id))
        } else {
            await deleteCategoria(id)
            setCategorias(categorias.filter(c => c.id !== id))
        }
    }

    return { marcas, categorias, loading, error, reload, applySavedMarca, applySavedCategoria, remove }
}
