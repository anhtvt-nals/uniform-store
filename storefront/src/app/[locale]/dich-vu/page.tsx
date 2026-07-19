import type {Metadata} from "next";
import {Link} from '@/i18n/navigation';
import {getRouteLocale} from "@/i18n/server";
import {SITE_NAME, SITE_URL, buildCanonicalUrl} from "@/lib/metadata";
import {getTranslations} from 'next-intl/server';
import {toOgLocale} from '@/i18n/locale-utils';
import {routing} from '@/i18n/routing';
import {ProcessSection} from "@/components/aura/process-section";
import {WhyChooseUsSection} from "@/components/aura/why-choose-us-section";
import {FloatingButtons} from "@/components/aura/floating-buttons";
import {ArrowRight} from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Services'});
    const ogLocale = toOgLocale(locale);

    return {
        title: t('title'),
        description: t('desc'),
        alternates: {
            canonical: buildCanonicalUrl(`/${locale}/dich-vu`),
            languages: Object.fromEntries(routing.locales.map((l) => [l, buildCanonicalUrl(`/${l}/dich-vu`)])),
        },
        openGraph: {
            title: `${t('title')} | ${SITE_NAME}`,
            description: t('desc'),
            type: "website",
            locale: ogLocale,
            url: `${SITE_URL}/dich-vu`,
        },
    };
}

export default async function ServicesPage() {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Services'});

    return (
        <main className="max-w-[1400px] mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-8 mt-16">
            <div className="bg-background rounded-[32px] p-8 md:p-12 shadow-sm text-center mb-6">
                <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tighter mb-4">{t('title')}</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto mb-8">{t('desc')}</p>
                <Link
                    href="/search"
                    className="bg-primary text-primary-foreground rounded-full px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-primary/90 transition shadow-lg inline-flex items-center gap-2"
                >
                    {t('cta')} <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
            <ProcessSection />
            <WhyChooseUsSection />
            <FloatingButtons />
        </main>
    );
}
