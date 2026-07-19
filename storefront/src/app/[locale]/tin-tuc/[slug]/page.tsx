import type {Metadata} from "next";
import {notFound} from "next/navigation";
import {SITE_NAME, SITE_URL, buildCanonicalUrl} from "@/lib/metadata";
import {getTranslations} from 'next-intl/server';
import {toOgLocale} from '@/i18n/locale-utils';
import {routing} from '@/i18n/routing';
import {FloatingButtons} from "@/components/aura/floating-buttons";
import {Link} from '@/i18n/navigation';
import {ReadingProgress} from '@/components/shared/reading-progress';
import {ArrowLeft, ArrowRight, Calendar, Clock, User} from 'lucide-react';
import {getAllBlogs, getBlogBySlug, formatBlogDate, getArticleImageUrl} from '@/lib/blog';
import {calculateReadingTime} from '@/lib/actions/articles';
import {Suspense} from 'react';

type Params = {locale: string; slug: string};

export async function generateMetadata({params}: {params: Promise<Params>}): Promise<Metadata> {
    const {locale, slug} = await params;
    const t = await getTranslations({locale, namespace: 'News'});
    const item = await getBlogBySlug(slug, locale);
    const ogLocale = toOgLocale(locale);

    if (!item) {
        return {
            title: t('notFoundTitle'),
            description: t('notFoundDesc'),
        };
    }

    return {
        title: item.title,
        description: item.excerpt,
        alternates: {
            canonical: buildCanonicalUrl(`/${locale}/tin-tuc/${slug}`),
            languages: Object.fromEntries(routing.locales.map((l) => [l, buildCanonicalUrl(`/${l}/tin-tuc/${slug}`)])),
        },
        openGraph: {
            title: `${item.title} | ${SITE_NAME}`,
            description: item.excerpt ?? undefined,
            type: "article",
            locale: ogLocale,
            url: `${SITE_URL}/tin-tuc/${slug}`,
            images: getArticleImageUrl(item) ? [{url: getArticleImageUrl(item)!}] : undefined,
        },
    };
}

export async function generateStaticParams() {
    const all = await getAllBlogs('vi');
    return all.map((item) => ({slug: item.slug}));
}

async function NewsDetailInner({locale, slug}: {locale: string; slug: string}) {
    const t = await getTranslations({locale, namespace: 'News'});
    const item = await getBlogBySlug(slug, locale);

    if (!item) {
        notFound();
    }

    const related = (await getAllBlogs(locale))
        .filter((n) => n.slug !== item.slug)
        .slice(0, 3);

    const imageUrl = getArticleImageUrl(item);
    const readingTime = calculateReadingTime(item.content ?? null);

    return (
        <>
            <article>
                {/* ── Hero ── */}
                <section className="relative w-full h-[55vh] min-h-[420px] max-h-[620px] overflow-hidden bg-muted">
                    {imageUrl && (
                        <img
                            src={imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                        />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 via-50% to-black/10" />

                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 lg:p-16">
                        <div className="max-w-[720px] mx-auto w-full">
                            {item.category && (
                                <span className="inline-block mb-4 px-3.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-[11px] font-semibold uppercase tracking-wider border border-white/10">
                                    {item.category.name}
                                </span>
                            )}

                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight leading-[1.1]">
                                {item.title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-5 text-sm text-white/70">
                                {item.author && (
                                    <span className="flex items-center gap-1.5">
                                        <User className="w-3.5 h-3.5" />
                                        {item.author}
                                    </span>
                                )}
                                {item.publishedAt && (
                                    <span className="flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {formatBlogDate(item.publishedAt, locale)}
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
                    {item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-8">
                            {item.tags.map(tag => (
                                <Link
                                    key={tag.id}
                                    href={`/tin-tuc?tag=${tag.slug}`}
                                    className="px-3 py-1 rounded-full bg-muted text-xs font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all duration-200"
                                >
                                    #{tag.name}
                                </Link>
                            ))}
                        </div>
                    )}

                    <div className="h-px bg-border/60 mb-10" />

                    {item.excerpt && (
                        <p className="text-lg leading-relaxed text-muted-foreground mb-10 pl-5 border-l-2 border-primary/30 italic">
                            {item.excerpt}
                        </p>
                    )}

                    {item.content && (
                        <div
                            className="article-content"
                            dangerouslySetInnerHTML={{__html: item.content}}
                        />
                    )}

                    <div className="my-12 border-t border-border/50" />

                    <Link
                        href="/tin-tuc"
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
                        {related.map((rel) => {
                            const relImage = getArticleImageUrl(rel);
                            return (
                                <Link
                                    key={rel.slug}
                                    href={`/tin-tuc/${rel.slug}`}
                                    className="group bg-background rounded-xl border border-border/60 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-250 overflow-hidden flex flex-col"
                                >
                                    <div className="relative h-40 overflow-hidden bg-muted">
                                        {relImage && (
                                            <img
                                                src={relImage}
                                                alt={rel.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                            />
                                        )}
                                    </div>
                                    <div className="p-5 flex flex-col flex-1">
                                        <span className="text-[11px] font-semibold text-primary uppercase tracking-widest mb-2">
                                            {formatBlogDate(rel.publishedAt, locale)}
                                        </span>
                                        <h3 className="font-semibold text-foreground mb-1.5 line-clamp-2 leading-snug">
                                            {rel.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground line-clamp-2 flex-1 leading-relaxed">
                                            {rel.excerpt}
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
        </>
    );
}

export default async function NewsDetailPage({params}: {params: Promise<Params>}) {
    const {locale, slug} = await params;

    return (
        <>
            <ReadingProgress />

            <main className="min-h-screen">
                <Suspense fallback={<div className="text-center py-16 text-muted-foreground">Loading...</div>}>
                    <NewsDetailInner locale={locale} slug={slug} />
                </Suspense>

                <FloatingButtons />
            </main>
        </>
    );
}
