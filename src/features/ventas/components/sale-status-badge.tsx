import type { SaleStatus } from '../types'

/** Highlights cancelled sales; completed ones get a neutral green badge. */
export function SaleStatusBadge({ status }: { status: SaleStatus }) {
    const cancelled = status === 'anulada'
    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cancelled
            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
            : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'}`}>
            {cancelled ? 'Anulada' : 'Completada'}
        </span>
    )
}
