import { AlertCircle } from 'lucide-react'

/** Inline error banner for forms; renders nothing without a message. */
export function FormError({ message, className = '' }: { message: string | null; className?: string }) {
    if (!message) return null
    return (
        <div className={`flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-sm animate-in fade-in slide-in-from-top-1 ${className}`}>
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{message}</span>
        </div>
    )
}
