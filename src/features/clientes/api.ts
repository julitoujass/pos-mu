import { apiJson } from '@/lib/http';
import type { Client, ClientCreate, ClientUpdate } from './types';

export function fetchClients(query?: string): Promise<Client[]> {
    const path = query ? `/clientes/?query=${encodeURIComponent(query)}` : '/clientes/';
    return apiJson(path, 'Failed to fetch clients');
}

export function createClient(data: ClientCreate): Promise<Client> {
    return apiJson('/clientes/', 'Failed to create client', { method: 'POST', body: data });
}

export function updateClient(id: string, data: ClientUpdate): Promise<Client> {
    return apiJson(`/clientes/${id}`, 'Failed to update client', { method: 'PATCH', body: data });
}
