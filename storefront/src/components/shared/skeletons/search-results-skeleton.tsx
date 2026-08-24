import { ProductGridSkeleton } from '@/components/shared/product-grid-skeleton';

export function SearchResultsSkeleton() {
    return (
        <div className="space-y-5 md:space-y-8">
            <div className="h-10 w-full animate-pulse rounded-full bg-muted" />
            <ProductGridSkeleton />
        </div>
    );
}
