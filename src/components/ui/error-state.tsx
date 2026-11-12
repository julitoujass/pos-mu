import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from './button'

type ErrorStateProps = {
    message: string
    /** Shows the "Reintentar" button when provided. */
    onRetry?: () => void
    /** True while the retry is in flight. */
    retrying?: boolean
    className?: string
}

/** Load error of a page or section, with an optional retry. */
export function ErrorState({ message, onRetry, retrying = false, className = '' }: ErrorStateProps) {
    return (
        <div
            role="alert"
            className={`flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl animate-fade-in ${className}`}
        >
            <div className="flex items-start gap-3 flex-1">
                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                <span>{message}</span>
            </div>
            {onRetry && (
                <Button
                    variant="plain"
                    onClick={onRetry}
                    loading={retrying}
                    icon={<RefreshCw size={16} />}
                    className="px-4 py-2 text-sm font-medium bg-card text-foreground border border-border hover:bg-muted self-start sm:self-auto"
                >
                    Reintentar
                </Button>
            )}
        </div>
    )
}
