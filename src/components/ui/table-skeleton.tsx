import { Skeleton } from './skeleton'

// Varied widths so the placeholder reads as text, not as a grid of blocks.
const CELL_WIDTHS = ['w-24', 'w-32', 'w-20', 'w-28', 'w-16']

type TableSkeletonProps = {
    /** Number of columns of the real table. */
    columns: number
    rows?: number
    className?: string
}

/** Placeholder with the same card, header and row rhythm as the data tables. */
export function TableSkeleton({ columns, rows = 6, className = '' }: TableSkeletonProps) {
    const cells = Array.from({ length: columns }, (_, i) => i)
    return (
        <div aria-hidden="true" className={`bg-card rounded-2xl border border-border overflow-hidden ${className}`}>
            <div className="flex gap-4 p-4 bg-muted">
                {cells.map(i => (
                    <div key={i} className="flex-1">
                        <Skeleton className="h-4 w-16" />
                    </div>
                ))}
            </div>
            <div className="divide-y divide-border">
                {Array.from({ length: rows }, (_, row) => (
                    <div key={row} className="flex items-center gap-4 p-4">
                        {cells.map(i => (
                            <div key={i} className="flex-1">
                                <Skeleton className={`h-5 ${CELL_WIDTHS[(row + i) % CELL_WIDTHS.length]} max-w-full`} />
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    )
}
