/**
 * Safely extracts a user-facing message from an unknown thrown value.
 * Returns `fallback` when no non-empty string message is available.
 */
export function getErrorMessage(error: unknown, fallback: string): string {
    if (typeof error === 'object' && error !== null && 'message' in error) {
        const message = (error as { message: unknown }).message;
        if (typeof message === 'string' && message.length > 0) {
            return message;
        }
    }
    return fallback;
}

/**
 * Extracts the `detail` of a FastAPI error body. Handles plain string details
 * and 422 validation arrays (uses the first item's `msg`).
 */
export function getApiErrorDetail(body: unknown, fallback: string): string {
    if (typeof body !== 'object' || body === null || !('detail' in body)) {
        return fallback;
    }
    const detail = (body as { detail: unknown }).detail;
    if (typeof detail === 'string' && detail.length > 0) {
        return detail;
    }
    if (Array.isArray(detail)) {
        const first: unknown = detail[0];
        if (typeof first === 'string' && first.length > 0) return first;
        if (typeof first === 'object' && first !== null && 'msg' in first) {
            const msg = (first as { msg: unknown }).msg;
            if (typeof msg === 'string' && msg.length > 0) return msg;
        }
    }
    return fallback;
}
