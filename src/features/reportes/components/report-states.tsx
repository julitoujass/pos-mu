import { BarChart2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

/** Placeholder shown inside a report card without data. */
export function ChartEmptyState({ label }: { label: string }) {
    return (
        <div className="text-center py-12 text-muted-foreground">
            <BarChart2 size={36} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm">{label}</p>
        </div>
    )
}

export function ReportesSkeleton() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}
            </div>
            <Skeleton className="h-64 rounded-2xl" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Skeleton className="h-80 rounded-2xl" />
                <Skeleton className="h-80 rounded-2xl" />
            </div>
        </div>
    )
}
