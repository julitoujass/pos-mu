
import { NextRequest, NextResponse } from 'next/server';

const TARGET_API_URL = 'http://127.0.0.1:8000/api/v1';

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    return handleProxy(request, await params);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    return handleProxy(request, await params);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    return handleProxy(request, await params);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    return handleProxy(request, await params);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    return handleProxy(request, await params);
}

async function handleProxy(request: NextRequest, params: { path: string[] }) {
    const path = params.path.join('/');
    const searchParams = request.nextUrl.searchParams.toString();
    const url = `${TARGET_API_URL}/${path}${searchParams ? `?${searchParams}` : ''}`;

    console.log(`[Proxy] Forwarding ${request.method} to: ${url}`);

    const headers = new Headers(request.headers);
    headers.delete('host'); // Let fetch set the host
    headers.delete('connection');

    // Forward the request
    try {
        const body = ['GET', 'HEAD'].includes(request.method) ? undefined : await request.blob();

        const response = await fetch(url, {
            method: request.method,
            headers: headers,
            body: body,
            cache: 'no-store',
        });

        console.log(`[Proxy] Response status: ${response.status}`);

        const data = await response.blob();
        return new NextResponse(data, {
            status: response.status,
            headers: response.headers,
        });

    } catch (error: any) {
        console.error('[Proxy] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
