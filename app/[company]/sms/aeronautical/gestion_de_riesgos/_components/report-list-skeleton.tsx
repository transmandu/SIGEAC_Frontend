import { Skeleton } from '@/components/ui/skeleton';

export function ReportListSkeleton() {
    return (
        <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="rounded-lg border p-4 space-y-3">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
            ))}
        </div>
    );
}
