import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
    SITE_NAME,
    SITE_URL,
    buildCanonicalUrl,
    truncateDescription,
} from '@/lib/metadata';
import { getTranslations } from 'next-intl/server';
import { toOgLocale } from '@/i18n/locale-utils';
import { routing } from '@/i18n/routing';
import { FloatingButtons } from '@/components/aura/floating-buttons';
import { Link } from '@/i18n/navigation';
import { ReadingProgress } from '@/components/shared/reading-progress';
import {
    ArrowLeft,
    ArrowRight,
    Calendar,
    User,
    Clock,
} from 'lucide-react';
import {
    getArticleBySlug,
    getArticles,
    formatArticleDate,
    getArticleImageUrl,
    calculateReadingTime,
} from '@/lib/actions/articles';


type Params = { locale: string; slug: string };

export async function generateMetadata({
    params,
}: {
    params: Promise<Params>;
}): Promise<Metadata> {
    const { locale, slug } = await params;
    const t = await getTranslations({ locale, namespace: 'News' });
    const article = await getArticleBySlug(slug, locale);
    const ogLocale = toOgLocale(locale);

    if (!article) {
        return {
            title: t('notFoundTitle'),
            description: t('notFoundDesc'),
        };
    }

    const title = article.seoTitle || article.title;
    const description = truncateDescription(
        article.seoDescription || article.excerpt,
        160,
    );
    const keywords = article.seoKeywords ?? undefined;
    const imageUrl = getArticleImageUrl(article);

    return {
        title,
        description,
        keywords,
        alternates: {
            canonical: buildCanonicalUrl(`/${locale}/news/${slug}`),
            languages: Object.fromEntries(
                routing.locales.map(l => [l, buildCanonicalUrl(`/${l}/news/${slug}`)]),
            ),
        },
        openGraph: {
            title: `${title} | ${SITE_NAME}`,
            description,
            type: 'article',
            locale: ogLocale,
            url: `${SITE_URL}/news/${slug}`,
            images: imageUrl ? [{ url: imageUrl, alt: article.title }] : undefined,
            publishedTime: article.publishedAt ?? undefined,
            authors: article.author ? [article.author] : undefined,
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: imageUrl ? [imageUrl] : undefined,
        },
    };
}

export default async function NewsDetailPage({
    params,
}: {
    params: Promise<Params>;
}) {
    const { locale, slug } = await params;
    const t = await getTranslations({ locale, namespace: 'News' });
    const article = await getArticleBySlug(slug, locale);

    if (!article) {
        notFound();
    }

    const imageUrl = getArticleImageUrl(article);
    const readingTime = calculateReadingTime(article.content);

    const { items: relatedItems } = await getArticles({ take: 4 }, locale);
    const related = relatedItems.filter(a => a.slug !== article.slug).slice(0, 3);

    return (
        <>
            <ReadingProgress />

            <main className="min-h-screen">
                <article>
                    {/* ── Hero ── */}
                    <section className="relative w-full h-[55vh] min-h-[420px] max-h-[620px] overflow-hidden bg-muted">
                        {imageUrl && (
                            <img
                                src={imageUrl}
                                alt={article.title}
                                className="w-full h-full object-cover"
                            />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 via-50% to-black/10" />

                        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 lg:p-16">
                            <div className="max-w-[720px] mx-auto w-full">
                                {article.category && (
                                    <span className="inline-block mb-4 px-3.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-[11px] font-semibold uppercase tracking-wider border border-white/10">
                                        {article.category.name}
                                    </span>
                                )}

                                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight leading-[1.1]">
                                    {article.title}
                                </h1>

                                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-5 text-sm text-white/70">
                                    {article.author && (
                                        <span className="flex items-center gap-1.5">
                                            <User className="w-3.5 h-3.5" />
                                            {article.author}
                                        </span>
                                    )}
                                    {article.publishedAt && (
                                        <span className="flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {formatArticleDate(article.publishedAt, locale)}
                                        </span>
                                    )}
                                    <span className="flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5" />
                                        {readingTime} {t('minRead')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ── Article body ── */}
                    <div className="max-w-[720px] mx-auto px-6 md:px-8 py-10 md:py-14">
                        {/* Tags */}
                        {article.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-8">
                                {article.tags.map(tag => (
                                    <Link
                                        key={tag.id}
                                        href={`/news?tag=${tag.slug}`}
                                        className="px-3 py-1 rounded-full bg-muted text-xs font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors duration-200"
                                    >
                                        #{tag.name}
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* Divider after tags */}
                        <div className="h-px bg-border/60 mb-10" />

                        {/* Excerpt */}
                        {article.excerpt && (
                            <p className="text-lg leading-relaxed text-muted-foreground mb-10 pl-5 border-l-2 border-primary/30 italic">
                                {article.excerpt}
                            </p>
                        )}

                        {/* Rich content */}
                        {article.content && (
                            <div
                                className="article-content"
                                dangerouslySetInnerHTML={{ __html: article.content }}
                            />
                        )}

                        {/* Gallery */}
                        {article.assets.length > 0 && (
                            <div className="mt-12 grid grid-cols-2 md:grid-cols-3 gap-3">
                                {article.assets.map(asset => (
                                    <img
                                        key={asset.id}
                                        src={asset.preview}
                                        alt={asset.name}
                                        className="w-full h-40 object-cover rounded-xl border border-border/50"
                                    />
                                ))}
                            </div>
                        )}

                        {/* Footer separator */}
                        <div className="my-12 border-t border-border/50" />

                        {/* Back navigation */}
                        <Link
                            href="/news"
                            className="group inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-200"
                        >
                            <ArrowLeft className="size-4 transition-transform duration-200 group-hover:-translate-x-1" />
                            {t('backToList')}
                        </Link>
                    </div>
                </article>

                {/* ── Related articles ── */}
                {related.length > 0 && (
                    <section className="max-w-[960px] mx-auto px-6 md:px-8 pb-16">
                        <div className="h-px bg-border/40 mb-10" />

                        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-6">
                            {t('relatedNews')}
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            {related.map(rel => {
                                const relImg = getArticleImageUrl(rel);
                                return (
                                    <Link
                                        key={rel.slug}
                                        href={`/news/${rel.slug}`}
                                        className="group bg-background rounded-xl border border-border/60 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-250 overflow-hidden flex flex-col"
                                    >
                                        <div className="relative h-40 overflow-hidden bg-muted">
                                            {relImg && (
                                                <img
                                                    src={relImg}
                                                    alt={rel.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                                />
                                            )}
                                        </div>
                                        <div className="p-5 flex flex-col flex-1">
                                            <span className="text-[11px] font-semibold text-primary uppercase tracking-widest mb-2">
                                                {formatArticleDate(rel.publishedAt, locale)}
                                            </span>
                                            <h3 className="font-semibold text-foreground mb-1.5 line-clamp-2 leading-snug">
                                                {rel.title}
                                            </h3>
                                            <p className="text-sm text-muted-foreground line-clamp-2 flex-1 leading-relaxed">
                                                {truncateDescription(rel.excerpt, 120)}
                                            </p>
                                            <div className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all duration-200">
                                                {t('readMore')}
                                                <ArrowRight className="size-3.5" />
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </section>
                )}

                <FloatingButtons />
            </main>
        </>
    );
}
