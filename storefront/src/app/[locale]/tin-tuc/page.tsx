import type {Metadata} from "next";
import {SITE_NAME, SITE_URL, buildCanonicalUrl, truncateDescription} from "@/lib/metadata";
import {getTranslations} from 'next-intl/server';
import {toOgLocale} from '@/i18n/locale-utils';
import {routing} from '@/i18n/routing';
import {Suspense} from 'react';
import {FloatingButtons} from "@/components/aura/floating-buttons";
import {Link} from '@/i18n/navigation';
import {
    ArrowRight,
    Calendar,
    Search,
    Clock,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import {
    getArticles,
    formatArticleDate,
    getArticleImageUrl,
    estimateReadingTime,
    getArticleCategories,
} from '@/lib/actions/articles';
import type {ArticleCard, ArticleCategoryItem} from '@/lib/actions/articles';

type SearchParams = {search?: string; category?: string; tag?: string; page?: string};

export async function generateMetadata(): Promise<Metadata> {
    const locale = await (await import('@/i18n/server')).getRouteLocale();
    const t = await getTranslations({locale, namespace: 'News'});
    const ogLocale = toOgLocale(locale);

    return {
        title: t('listTitle'),
        description: t('listDesc'),
        alternates: {
            canonical: buildCanonicalUrl(`/${locale}/tin-tuc`),
            languages: Object.fromEntries(routing.locales.map((l) => [l, buildCanonicalUrl(`/${l}/tin-tuc`)])),
        },
        openGraph: {
            title: `${t('listTitle')} | ${SITE_NAME}`,
            description: t('listDesc'),
            type: "website",
            locale: ogLocale,
            url: `${SITE_URL}/tin-tuc`,
        },
    };
}

const PAGE_SIZE = 12;

function buildPageUrl(page: number, sp: SearchParams): string {
    const params = new URLSearchParams();
    if (page > 1) params.set('page', String(page));
    if (sp.search) params.set('search', sp.search);
    if (sp.category) params.set('category', sp.category);
    if (sp.tag) params.set('tag', sp.tag);
    const qs = params.toString();
    return `/tin-tuc${qs ? `?${qs}` : ''}`;
}

/* ── Card components ── */

function FeaturedCard({item, locale, t}: {item: ArticleCard; locale: string; t: (key: string) => string}) {
    const img = getArticleImageUrl(item);
    return (
        <Link
            href={`/tin-tuc/${item.slug}`}
            className="group relative mt-8 block w-full rounded-2xl overflow-hidden bg-muted border border-border/50 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.1)] transition-all duration-300"
        >
            <div className="aspect-[2.2/1] md:aspect-[2.8/1] relative overflow-hidden">
                {img ? (
                    <img
                        src={img}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                    {item.category && (
                        <span className="inline-block mb-3 px-3 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] font-semibold uppercase tracking-wider border border-white/10">
                            {item.category.name}
                        </span>
                    )}
                    <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white leading-tight max-w-2xl">
                        {item.title}
                    </h2>
                    <div className="flex flex-wrap items-center gap-3 mt-2.5 text-xs text-white/60">
                        <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatArticleDate(item.publishedAt, locale)}
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {estimateReadingTime(item.excerpt)} {t('minRead')}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}

function MediumCard({item, locale, t, index}: {item: ArticleCard; locale: string; t: (key: string) => string; index: number}) {
    const img = getArticleImageUrl(item);
    return (
        <Link
            href={`/tin-tuc/${item.slug}`}
            className="group block rounded-xl overflow-hidden bg-background border border-border/50 shadow-[0_1px_6px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-250 animate-fade-up"
            style={{animationDelay: `${index * 80}ms`}}
        >
            <div className="aspect-[1.8/1] overflow-hidden bg-muted">
                {img ? (
                    <img src={img} alt={item.title} className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/5 to-primary/[0.02]" />
                )}
            </div>
            <div className="p-5">
                {item.category && (
                    <span className="inline-block mb-2 px-2.5 py-0.5 rounded-full bg-primary/8 text-primary text-[10px] font-semibold uppercase tracking-wider">
                        {item.category.name}
                    </span>
                )}
                <h3 className="font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-200">
                    {item.title}
                </h3>
                <div className="flex items-center gap-3 mt-2.5 text-[11px] text-muted-foreground">
                    <span>{formatArticleDate(item.publishedAt, locale)}</span>
                    <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {estimateReadingTime(item.excerpt)} {t('minRead')}
                    </span>
                </div>
            </div>
        </Link>
    );
}

function SmallCard({item, locale, t, index}: {item: ArticleCard; locale: string; t: (key: string) => string; index: number}) {
    const img = getArticleImageUrl(item);
    return (
        <Link
            href={`/tin-tuc/${item.slug}`}
            className="group block rounded-xl overflow-hidden bg-background border border-border/40 shadow-[0_1px_4px_rgba(0,0,0,0.02)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.07)] transition-all duration-250 animate-fade-up"
            style={{animationDelay: `${index * 80}ms`}}
        >
            <div className="aspect-[1.6/1] overflow-hidden bg-muted">
                {img ? (
                    <img src={img} alt={item.title} className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/5 to-primary/[0.02]" />
                )}
            </div>
            <div className="p-4">
                {item.category && (
                    <span className="inline-block mb-1.5 px-2 py-0.5 rounded-full bg-primary/8 text-primary text-[9px] font-semibold uppercase tracking-wider">
                        {item.category.name}
                    </span>
                )}
                <h3 className="text-sm font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-200">
                    {item.title}
                </h3>
                <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
                    <span>{formatArticleDate(item.publishedAt, locale)}</span>
                    <span>·</span>
                    <span className="flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        {estimateReadingTime(item.excerpt)} {t('minRead')}
                    </span>
                </div>
            </div>
        </Link>
    );
}

function RegularCard({item, t, index}: {item: ArticleCard; t: (key: string) => string; index: number}) {
    const img = getArticleImageUrl(item);
    return (
        <Link
            href={`/tin-tuc/${item.slug}`}
            className="group block rounded-xl overflow-hidden bg-background border border-border/40 shadow-[0_1px_4px_rgba(0,0,0,0.02)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.07)] transition-all duration-250 animate-fade-up"
            style={{animationDelay: `${index * 60}ms`}}
        >
            <div className="aspect-[1.6/1] overflow-hidden bg-muted">
                {img ? (
                    <img src={img} alt={item.title} className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/5 to-primary/[0.02]" />
                )}
            </div>
            <div className="p-4">
                {item.category && (
                    <span className="inline-block mb-1.5 px-2 py-0.5 rounded-full bg-primary/8 text-primary text-[9px] font-semibold uppercase tracking-wider">
                        {item.category.name}
                    </span>
                )}
                <h3 className="text-sm font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-200">
                    {item.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1.5 leading-relaxed">
                    {truncateDescription(item.excerpt, 100)}
                </p>
                <div className="mt-2.5 inline-flex items-center gap-1 text-xs font-medium text-primary group-hover:gap-1.5 transition-all duration-200">
                    {t('readMore')}
                    <ArrowRight className="size-3" />
                </div>
            </div>
        </Link>
    );
}

/* ── Page ── */

function LoadingSkeleton() {
    return (
        <div className="max-w-[1200px] mx-auto px-6 md:px-8 py-20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {Array.from({length: 6}).map((_, i) => (
                    <div key={i} className="rounded-xl overflow-hidden border border-border/40">
                        <div className="aspect-[1.6/1] bg-muted animate-pulse" />
                        <div className="p-4 space-y-3">
                            <div className="h-3 w-16 bg-muted rounded animate-pulse" />
                            <div className="h-4 w-full bg-muted rounded animate-pulse" />
                            <div className="h-3 w-3/4 bg-muted rounded animate-pulse" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

async function NewsListContent({
    params,
    searchParams,
}: {
    params: Promise<{locale: string}>;
    searchParams: Promise<SearchParams>;
}) {
    const {locale} = await params;
    const sp = await searchParams;
    const t = await getTranslations({locale, namespace: 'News'});

    const page = sp.page ? Math.max(1, parseInt(sp.page, 10)) : 1;
    const {items, totalItems} = await getArticles(
        {
            skip: (page - 1) * PAGE_SIZE,
            take: PAGE_SIZE,
            search: sp.search,
            category: sp.category,
            tag: sp.tag,
        },
        locale,
    );
    const categories = await getArticleCategories(locale);

    const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
    const hasActiveFilter = !!(sp.search || sp.category || sp.tag);

    return (
        <main className="min-h-screen">
            {/* ── Hero ── */}
            <section className="relative bg-gradient-to-b from-primary/[0.04] via-background to-background pt-20 md:pt-24 pb-0">
                <div className="max-w-[1200px] mx-auto px-6 md:px-8">
                    <div className="max-w-2xl">
                        <span className="inline-block text-[11px] font-semibold text-primary uppercase tracking-[0.2em]">
                            {t('featured')}
                        </span>
                        <h1 className="text-4xl md:text-5xl lg:text-[3.25rem] font-bold tracking-tight leading-[1.08] mt-3">
                            {t('listTitle')}
                        </h1>
                        <p className="text-base text-muted-foreground mt-3 max-w-lg leading-relaxed">
                            {t('listDesc')}
                        </p>
                    </div>

                    <form method="get" className="mt-6 max-w-md">
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                            <input
                                type="search"
                                name="search"
                                defaultValue={sp.search ?? ''}
                                placeholder={t('searchPlaceholder')}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border/60 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                            />
                        </div>
                    </form>

                    {!hasActiveFilter && items.length > 0 && (
                        <FeaturedCard item={items[0]} locale={locale} t={t} />
                    )}
                </div>
            </section>

            {/* ── Sticky category filter ── */}
            {categories.length > 0 && (
                <div className="sticky top-16 lg:top-20 z-30 bg-background/80 backdrop-blur-lg border-b border-border/30">
                    <div className="max-w-[1200px] mx-auto px-6 md:px-8">
                        <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-none">
                            <Link
                                href="/tin-tuc"
                                className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                                    !sp.category
                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                        : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                                }`}
                            >
                                {t('allCategories')}
                            </Link>
                            {categories.map((cat: ArticleCategoryItem) => (
                                <Link
                                    key={cat.slug}
                                    href={`/tin-tuc?category=${cat.slug}`}
                                    className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                                        sp.category === cat.slug
                                            ? 'bg-primary text-primary-foreground shadow-sm'
                                            : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                                    }`}
                                >
                                    {cat.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Grid ── */}
            <div className="max-w-[1200px] mx-auto px-6 md:px-8 py-10 md:py-12">
                {items.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-muted-foreground">{t('noResults')}</p>
                    </div>
                ) : (
                    <>
                        {hasActiveFilter ? (
                            items.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {items.slice(0, 2).map((item, i) => (
                                        <MediumCard key={item.slug} item={item} locale={locale} t={t} index={i} />
                                    ))}
                                </div>
                            )
                        ) : (
                            items.length > 1 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {items.slice(1, 3).map((item, i) => (
                                        <MediumCard key={item.slug} item={item} locale={locale} t={t} index={i} />
                                    ))}
                                </div>
                            )
                        )}

                        {(() => {
                            const start = hasActiveFilter ? 2 : 3;
                            const end = hasActiveFilter ? 5 : 6;
                            return items.length > start ? (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
                                    {items.slice(start, end).map((item, i) => (
                                        <SmallCard key={item.slug} item={item} locale={locale} t={t} index={i} />
                                    ))}
                                </div>
                            ) : null;
                        })()}

                        {(() => {
                            const threshold = hasActiveFilter ? 5 : 6;
                            return items.length > threshold ? (
                                <>
                                    <div className="h-px bg-border/30 my-8" />
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                        {items.slice(threshold).map((item, i) => (
                                            <RegularCard key={item.slug} item={item} t={t} index={i} />
                                        ))}
                                    </div>
                                </>
                            ) : null;
                        })()}
                    </>
                )}

                {totalPages > 1 && (
                    <nav className="mt-14 flex items-center justify-center gap-1.5" aria-label="Pagination">
                        {page > 1 && (
                            <Link
                                href={buildPageUrl(page - 1, sp)}
                                className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
                            >
                                <ChevronLeft className="size-4" />
                            </Link>
                        )}
                        {Array.from({length: totalPages}, (_, i) => i + 1).map(p => (
                            <Link
                                key={p}
                                href={buildPageUrl(p, sp)}
                                className={`inline-flex items-center justify-center w-9 h-9 rounded-lg text-sm font-medium transition-all duration-200 ${
                                    p === page
                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                }`}
                            >
                                {p}
                            </Link>
                        ))}
                        {page < totalPages && (
                            <Link
                                href={buildPageUrl(page + 1, sp)}
                                className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
                            >
                                <ChevronRight className="size-4" />
                            </Link>
                        )}
                    </nav>
                )}
            </div>

            <FloatingButtons />
        </main>
    );
}

export default async function NewsListPage({
    params,
    searchParams,
}: {
    params: Promise<{locale: string}>;
    searchParams: Promise<SearchParams>;
}) {
    return (
        <Suspense fallback={<LoadingSkeleton />}>
            <NewsListContent params={params} searchParams={searchParams} />
        </Suspense>
    );
}
