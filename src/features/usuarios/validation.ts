export type NewUserInput = {
    email: string
    password: string
    nombre: string
    rolId: number | null
}

/** Returns the first problem with the new-user form, or null when it is valid. */
export function validateNewUser({ email, password, nombre, rolId }: NewUserInput): string | null {
    const trimmedEmail = email.trim()
    if (!trimmedEmail) return 'Ingresá el email'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) return 'El email no es válido'
    if (password.length < 8 || password.length > 72) return 'La contraseña debe tener entre 8 y 72 caracteres'
    if (!nombre.trim()) return 'Ingresá el nombre'
    if (rolId === null) return 'Elegí un rol'
    return null
}
