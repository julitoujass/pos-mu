import { NextRequest, NextResponse } from 'next/server';

const DEV_FALLBACK_API_URL = 'http://127.0.0.1:8000/api/v1';

// Only these request headers are forwarded to the backend.
const REQUEST_HEADER_ALLOWLIST = [
    'authorization',
    'content-type',
    'accept',
    'accept-language',
    'idempotency-key',
];

// Only these backend response headers are returned to the browser.
const RESPONSE_HEADER_ALLOWLIST = ['content-type', 'content-disposition', 'cache-control'];

type RouteContext = { params: Promise<{ path: string[] }> };

export async function GET(request: NextRequest, { params }: RouteContext) {
    return handleProxy(request, await params);
}

export async function POST(request: NextRequest, { params }: RouteContext) {
    return handleProxy(request, await params);
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
    return handleProxy(request, await params);
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
    return handleProxy(request, await params);
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
    return handleProxy(request, await params);
}

function resolveBackendUrl(): string | null {
    const configured = process.env.BACKEND_API_URL?.trim();
    if (configured) {
        return configured.replace(/\/+$/, '');
    }
    if (process.env.NODE_ENV !== 'production') {
        return DEV_FALLBACK_API_URL;
    }
    return null;
}

async function handleProxy(request: NextRequest, params: { path: string[] }) {
    const backendUrl = resolveBackendUrl();
    if (!backendUrl) {
        return NextResponse.json({ detail: 'Backend URL not configured' }, { status: 500 });
    }

    const segments = params.path;
    if (segments.some((segment) => segment === '..' || segment.includes('\\'))) {
        return NextResponse.json({ detail: 'Invalid path' }, { status: 400 });
    }

    const path = segments.map((segment) => encodeURIComponent(segment)).join('/');
    const search = request.nextUrl.search;
    const url = `${backendUrl}/${path}${search}`;

    const headers = new Headers();
    for (const name of REQUEST_HEADER_ALLOWLIST) {
        const value = request.headers.get(name);
        if (value !== null) {
            headers.set(name, value);
        }
    }

    try {
        const body = ['GET', 'HEAD'].includes(request.method) ? undefined : await request.blob();

        const response = await fetch(url, {
            method: request.method,
            headers,
            body,
            cache: 'no-store',
        });

        const data = await response.blob();

        const responseHeaders = new Headers();
        for (const name of RESPONSE_HEADER_ALLOWLIST) {
            const value = response.headers.get(name);
            if (value !== null) {
                responseHeaders.set(name, value);
            }
        }

        return new NextResponse(data, {
            status: response.status,
            headers: responseHeaders,
        });
    } catch (error: unknown) {
        console.error('[api-proxy]', request.method, `/${path}`, error instanceof Error ? error.name : 'unknown error');
        return NextResponse.json({ detail: 'Backend unavailable' }, { status: 502 });
    }
}
