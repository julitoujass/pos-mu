import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GET, POST } from './route';

const fetchMock = vi.fn();

function ctx(...path: string[]) {
    return { params: Promise.resolve({ path }) };
}

function backendResponse(body = '{"ok":true}', init: ResponseInit = {}) {
    return new Response(body, { status: 200, ...init });
}

describe('api proxy route', () => {
    beforeEach(() => {
        fetchMock.mockReset();
        fetchMock.mockResolvedValue(backendResponse());
        vi.stubGlobal('fetch', fetchMock);
        vi.stubEnv('BACKEND_API_URL', 'http://backend.test/api/v1');
    });

    afterEach(() => {
        vi.unstubAllEnvs();
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it('forwards only allowlisted request headers', async () => {
        const request = new NextRequest('http://localhost/api/python/ventas/hoy', {
            headers: {
                authorization: 'Bearer token',
                'content-type': 'application/json',
                accept: 'application/json',
                cookie: 'session=secret',
                origin: 'http://evil.test',
            },
        });

        await GET(request, ctx('ventas', 'hoy'));

        const init = fetchMock.mock.calls[0][1] as RequestInit;
        const sent = init.headers as Headers;
        expect(sent.get('authorization')).toBe('Bearer token');
        expect(sent.get('content-type')).toBe('application/json');
        expect(sent.get('accept')).toBe('application/json');
        expect(sent.has('cookie')).toBe(false);
        expect(sent.has('origin')).toBe(false);
    });

    it('returns only allowlisted response headers and preserves status', async () => {
        fetchMock.mockResolvedValue(
            backendResponse('nope', {
                status: 409,
                headers: {
                    'content-type': 'text/plain',
                    'cache-control': 'no-store',
                    'set-cookie': 'a=b',
                    'x-internal': 'secret',
                },
            }),
        );

        const response = await GET(new NextRequest('http://localhost/api/python/x'), ctx('x'));

        expect(response.status).toBe(409);
        expect(response.headers.get('content-type')).toBe('text/plain');
        expect(response.headers.get('cache-control')).toBe('no-store');
        expect(response.headers.has('set-cookie')).toBe(false);
        expect(response.headers.has('x-internal')).toBe(false);
        expect(await response.text()).toBe('nope');
    });

    it('rejects ".." path segments with 400 without calling the backend', async () => {
        const response = await GET(new NextRequest('http://localhost/api/python/a'), ctx('a', '..', 'b'));

        expect(response.status).toBe(400);
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('returns 502 with a generic body when fetch throws', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        fetchMock.mockRejectedValue(new Error('connect ECONNREFUSED 10.0.0.5:8000'));

        const response = await GET(new NextRequest('http://localhost/api/python/x'), ctx('x'));

        expect(response.status).toBe(502);
        const text = await response.text();
        expect(JSON.parse(text)).toEqual({ detail: 'Backend unavailable' });
        expect(text).not.toContain('ECONNREFUSED');
    });

    it('uses BACKEND_API_URL and strips trailing slashes', async () => {
        vi.stubEnv('BACKEND_API_URL', 'http://backend.test/api/v1//');

        await GET(new NextRequest('http://localhost/api/python/clientes'), ctx('clientes'));

        expect(fetchMock.mock.calls[0][0]).toBe('http://backend.test/api/v1/clientes');
    });

    it('returns 500 when BACKEND_API_URL is missing in production', async () => {
        vi.stubEnv('BACKEND_API_URL', '');
        vi.stubEnv('NODE_ENV', 'production');

        const response = await GET(new NextRequest('http://localhost/api/python/x'), ctx('x'));

        expect(response.status).toBe(500);
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('preserves the query string', async () => {
        await GET(new NextRequest('http://localhost/api/python/clientes?query=ana&x=1'), ctx('clientes'));

        expect(fetchMock.mock.calls[0][0]).toBe('http://backend.test/api/v1/clientes?query=ana&x=1');
    });

    it('forwards the body and method for POST', async () => {
        const request = new NextRequest('http://localhost/api/python/ventas', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ total: 10 }),
        });

        await POST(request, ctx('ventas'));

        const init = fetchMock.mock.calls[0][1] as RequestInit;
        expect(init.method).toBe('POST');
        expect(await (init.body as Blob).text()).toBe('{"total":10}');
    });
});
