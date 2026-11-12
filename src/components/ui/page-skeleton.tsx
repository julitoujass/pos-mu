import { Skeleton } from './skeleton'
import { TableSkeleton } from './table-skeleton'

/** Page title + subtitle placeholder, matching the header of every dashboard page. */
export function PageHeaderSkeleton() {
    return (
        <div className="space-y-2" aria-hidden="true">
            <Skeleton className="h-9 w-56" />
            <Skeleton className="h-5 w-72 max-w-full" />
        </div>
    )
}

/** Generic page shell shown by `loading.tsx` while a dashboard route loads. */
export function PageSkeleton() {
    return (
        <div className="space-y-6" role="status" aria-label="Cargando">
            <PageHeaderSkeleton />
            <Skeleton className="h-12 w-full rounded-xl" />
            <TableSkeleton columns={5} />
        </div>
    )
}
