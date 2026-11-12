import { createClient as createSupabaseClient } from './supabase/client';
import { ApiError, getApiErrorDetail } from './errors';

export { ApiError };

// Use the Next.js route-handler proxy to avoid CORS
export const API_URL = '/api/python';

export async function getAuthHeaders(): Promise<Record<string, string>> {
    const supabase = createSupabaseClient();
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
        console.error('Error getting session:', error);
    }

    const headers: Record<string, string> = {
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
export async function toApiError(res: Response, fallback: string): Promise<ApiError> {
    const body: unknown = await res.json().catch(() => ({}));
    return new ApiError(getApiErrorDetail(body, fallback), res.status);
}

type ApiRequestOptions = {
    method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
    /** JSON-serialized as the request body. */
    body?: unknown;
    /** Extra headers merged over the auth headers. */
    headers?: Record<string, string>;
};

/**
 * Authenticated call to the backend. `path` is relative to the proxy
 * (e.g. `/ventas/hoy`). Reads are never cached. Throws an ApiError with the
 * backend `detail` (or `errorFallback`) when the response is not ok.
 */
export async function apiFetch(
    path: string,
    errorFallback: string,
    { method = 'GET', body, headers: extraHeaders }: ApiRequestOptions = {},
): Promise<Response> {
    const headers = { ...(await getAuthHeaders()), ...extraHeaders };

    const init: RequestInit = method === 'GET'
        ? { headers, cache: 'no-store' }
        : { method, headers };
    if (body !== undefined) {
        init.body = JSON.stringify(body);
    }

    const res = await fetch(`${API_URL}${path}`, init);
    if (!res.ok) throw await toApiError(res, errorFallback);
    return res;
}

/** `apiFetch` that parses the JSON body of the response. */
export async function apiJson<T>(
    path: string,
    errorFallback: string,
    options?: ApiRequestOptions,
): Promise<T> {
    const res = await apiFetch(path, errorFallback, options);
    return res.json();
}

/** Builds `?fecha_inicio=&fecha_fin=`-style query strings, skipping empty values. */
export function toQueryString(params: Record<string, string | undefined>): string {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        if (value) search.append(key, value);
    }
    const query = search.toString();
    return query ? `?${query}` : '';
}
