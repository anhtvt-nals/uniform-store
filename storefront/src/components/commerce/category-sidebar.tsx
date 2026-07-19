'use client';

import { use } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface CategoryNode {
    id: string;
    name: string;
    slug: string;
    children: CategoryNode[] | null;
}

interface CategorySidebarProps {
    categoriesPromise: Promise<{ data: { collections: { items: CategoryNode[] } } }>;
}

function CategoryTree({ nodes, currentSlug, depth = 0 }: { nodes: CategoryNode[]; currentSlug?: string; depth?: number }) {
    return (
        <div className={cn('space-y-0.5', depth > 0 && 'ml-3 mt-0.5')}>
            {nodes.map((cat) => {
                const isActive = cat.slug === currentSlug;
                const hasChildren = cat.children && cat.children.length > 0;
                return (
                    <div key={cat.id}>
                        <Link
                            href={`/collection/${cat.slug}`}
                            className={cn(
                                'block px-3 py-1.5 text-sm rounded-md transition-colors hover:bg-muted',
                                isActive
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-muted-foreground',
                            )}
                        >
                            {cat.name}
                        </Link>
                        {hasChildren && (
                            <CategoryTree nodes={cat.children ?? []} currentSlug={currentSlug} depth={depth + 1} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export function CategorySidebar({ categoriesPromise }: CategorySidebarProps) {
    const t = useTranslations('Filters');
    const params = useParams();
    const currentSlug = params?.slug as string | undefined;

    const result = use(categoriesPromise);
    const collections = result.data.collections?.items ?? [];

    if (collections.length === 0) return null;

    return (
        <div className="space-y-2">
            <h2 className="font-semibold text-lg">{t('categories')}</h2>
            <CategoryTree nodes={collections} currentSlug={currentSlug} />
        </div>
    );
}
