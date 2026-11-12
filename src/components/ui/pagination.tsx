import { ChevronLeft, ChevronRight } from 'lucide-react'

type PaginationProps = {
    /** Zero-based current page. */
    page: number
    pageCount: number
    onPageChange: (page: number) => void
    /** Left-side text, e.g. "1-50 de 320". */
    summary: string
    /** Blocks both buttons, e.g. while the next page is loading. */
    disabled?: boolean
    className?: string
}

const BUTTON_CLASS = 'p-2 rounded-lg border border-input bg-card hover:bg-muted disabled:opacity-50 transition-colors'

/** Previous / next footer shared by the paginated tables. */
export function Pagination({ page, pageCount, onPageChange, summary, disabled = false, className = '' }: PaginationProps) {
    return (
        <div className={`flex items-center justify-between text-sm text-muted-foreground ${className}`}>
            <span className="tabular-nums">{summary}</span>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={disabled || page === 0}
                    aria-label="Página anterior"
                    className={BUTTON_CLASS}
                >
                    <ChevronLeft size={16} />
                </button>
                <span className="tabular-nums">Página {page + 1} de {pageCount}</span>
                <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={disabled || page + 1 >= pageCount}
                    aria-label="Página siguiente"
                    className={BUTTON_CLASS}
                >
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    )
}
