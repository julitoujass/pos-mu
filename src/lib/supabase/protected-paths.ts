/** Route prefixes that require an authenticated Supabase session. */
const PROTECTED_PREFIXES = ['/dashboard', '/ticket']

export function isProtectedPath(pathname: string): boolean {
    return PROTECTED_PREFIXES.some(prefix => pathname === prefix || pathname.startsWith(`${prefix}/`))
}
