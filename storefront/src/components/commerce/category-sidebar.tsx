'use client';

import {useEffect, useMemo, useState} from 'react';
import Link from 'next/link';
import {useParams, usePathname, useSearchParams} from 'next/navigation';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import {Spinner} from '@/components/ui/spinner';

interface CategoryNode {
    id: string;
    name: string;
    slug: string;
    children: CategoryNode[] | null;
}

interface CategorySidebarProps {
    categories: CategoryNode[];
    currentSlug?: string;
}

function findParentSlug(nodes: CategoryNode[], slug?: string): string | undefined {
    if (!slug) return undefined;

    for (const node of nodes) {
        if (node.slug === slug) return node.slug;
        if (node.children && findParentSlug(node.children, slug)) return node.slug;
    }

    return undefined;
}

export function CategorySidebar({categories, currentSlug: currentSlugProp}: CategorySidebarProps) {
    const t = useTranslations('Filters');
    const tCommon = useTranslations('Common');
    const params = useParams();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const searchParamsString = searchParams.toString();
    const currentSlug = currentSlugProp ?? params?.slug as string | undefined;
    const currentParentSlug = useMemo(() => findParentSlug(categories, currentSlug), [categories, currentSlug]);
    const [activeSlug, setActiveSlug] = useState(() => currentParentSlug ?? categories[0]?.slug);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);

    useEffect(() => {
        if (currentParentSlug) setActiveSlug(currentParentSlug);
    }, [currentParentSlug]);

    useEffect(() => {
        setIsLoadingProducts(false);
    }, [pathname, searchParamsString]);

    const activeCategory = categories.find((category) => category.slug === activeSlug) ?? categories[0];
    const children = activeCategory?.children ?? [];
    const isSearchPage = pathname.endsWith('/search');

    const getCategoryHref = (slug: string) => {
        if (!isSearchPage) return `/collection/${slug}`;

        const nextParams = new URLSearchParams(searchParams.toString());
        nextParams.set('collection', slug);
        nextParams.delete('page');
        return `${pathname}?${nextParams.toString()}`;
    };

    const showLoadingOverlay = (slug: string) => {
        if (slug !== currentSlug) setIsLoadingProducts(true);
    };

    if (categories.length === 0) return null;

    return (
        <>
            <div
                aria-hidden={!isLoadingProducts}
                className={cn(
                    'fixed inset-0 z-100 flex items-center justify-center bg-background/45 backdrop-blur-[2px] transition-opacity duration-300 ease-out',
                    isLoadingProducts ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
                )}
            >
                <div className="flex items-center gap-3 rounded-2xl border border-border/80 bg-background/95 px-4 py-3 text-sm font-medium text-foreground shadow-lg">
                    <Spinner className="size-5 text-primary" />
                    <span role="status">{tCommon('loading')}</span>
                </div>
            </div>

            <nav aria-label={t('categories')} className="space-y-3">
                <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {categories.map((category) => {
                    const isActive = category.slug === activeCategory?.slug;
                    return (
                        <Link
                            key={category.id}
                            href={getCategoryHref(category.slug)}
                            onClick={() => {
                                setActiveSlug(category.slug);
                                showLoadingOverlay(category.slug);
                            }}
                            aria-current={isActive ? 'page' : undefined}
                            className={cn(
                                'shrink-0 rounded-full border px-3 py-2 text-xs font-semibold transition-colors sm:px-4 sm:text-sm',
                                isActive
                                    ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                                    : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground',
                            )}
                        >
                            {category.name}
                        </Link>
                    );
                })}
                </div>

                {children.length > 0 && (
                    <div className="flex flex-wrap gap-2 border-t border-border pt-3">
                    {children.map((category) => {
                        const isActive = category.slug === currentSlug;
                        return (
                            <Link
                                key={category.id}
                                href={getCategoryHref(category.slug)}
                                onClick={() => showLoadingOverlay(category.slug)}
                                className={cn(
                                    'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors sm:text-sm',
                                    isActive
                                        ? 'border-primary/30 bg-primary/10 text-primary'
                                        : 'border-transparent bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary',
                                )}
                            >
                                {category.name}
                            </Link>
                        );
                    })}
                    </div>
                )}
            </nav>
        </>
    );
}
