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
