export function ProductGridSkeleton() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="h-5 w-32 bg-muted animate-pulse rounded" />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
                {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="overflow-hidden rounded-2xl border border-border bg-card p-2">
                        <div className="aspect-[16/15] rounded-xl bg-muted animate-pulse" />
                        <div className="space-y-2 px-1 pt-3">
                            <div className="h-5 bg-muted animate-pulse rounded w-3/4" />
                            <div className="h-6 bg-muted animate-pulse rounded w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
