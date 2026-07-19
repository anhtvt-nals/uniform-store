import {getTranslations} from 'next-intl/server';
import {getRouteLocale} from '@/i18n/server';
import {ArrowRight, Calendar} from 'lucide-react';
import {Link} from '@/i18n/navigation';
import {getAllBlogs, formatBlogDate, getArticleImageUrl} from '@/lib/blog';
import {Suspense} from 'react';

async function NewsSectionInner() {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Home'});
    const news = (await getAllBlogs(locale)).slice(0, 3);

    if (news.length === 0) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {news.map((item) => (
                <Link
                    key={item.slug}
                    href={`/tin-tuc/${item.slug}`}
                    className="bg-background rounded-[24px] border border-border shadow-sm overflow-hidden group hover:shadow-md transition-all flex flex-col"
                >
                    <div className="relative h-48 overflow-hidden bg-muted">
                        {getArticleImageUrl(item) && (
                            <img
                                src={getArticleImageUrl(item)!}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                            />
                        )}
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-widest mb-3">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatBlogDate(item.publishedAt, locale)}
                        </div>
                        <h3 className="font-bold text-foreground mb-2 line-clamp-2">{item.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 flex-1">{item.excerpt}</p>
                    </div>
                </Link>
            ))}
        </div>
    );
}

export async function NewsSection() {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Home'});

    return (
        <div className="md:col-span-12 py-12">
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-10">
                <div>
                    <h2 className="text-3xl font-black text-foreground tracking-tighter mb-2">{t('newsTitle')}</h2>
                    <p className="text-muted-foreground">{t('newsDesc')}</p>
                </div>
                <Link
                    href="/tin-tuc"
                    className="group inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline underline-offset-4 transition-colors w-fit"
                >
                    {t('newsViewAll')}
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
            </div>
            <Suspense>
                <NewsSectionInner />
            </Suspense>
        </div>
    );
}
