export type CloverCallbackMessage = { type: 'success' | 'error'; message: string }

// Codes emitted by the backend callback (admin-mu app/integrations/clover/connection.py).
const ERROR_MESSAGES: Record<string, string> = {
    state_invalido: 'El enlace de conexión no es válido. Iniciá la conexión de nuevo desde Configuración.',
    state_expirado: 'La conexión con Clover expiró. Volvé a intentarlo.',
    parametros: 'Clover no devolvió la autorización. Volvé a intentarlo y aceptá los permisos.',
    sin_permiso: 'Solo un administrador activo puede conectar Clover.',
    codigo_rechazado: 'Clover rechazó la autorización. Volvé a intentarlo.',
    clover_no_disponible: 'Clover no respondió. Probá de nuevo en unos minutos.',
    sin_integracion: 'Falta configurar el terminal de pago en el sistema.',
    no_configurado: 'El servidor no tiene configurada la integración con Clover.',
    error_interno: 'Ocurrió un error al guardar la conexión con Clover.',
}

const GENERIC_ERROR = 'No se pudo conectar Clover. Volvé a intentarlo.'

/** Reads the `?clover=` result left by the backend redirect. Null when there is nothing to show. */
export function cloverCallbackMessage(params: { get(name: string): string | null }): CloverCallbackMessage | null {
    const result = params.get('clover')
    if (result === 'ok') return { type: 'success', message: 'Clover conectado' }
    if (result === 'error') {
        const motivo = params.get('motivo')
        return { type: 'error', message: (motivo && ERROR_MESSAGES[motivo]) || GENERIC_ERROR }
    }
    return null
}
