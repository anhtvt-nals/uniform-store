import type {Metadata} from "next";
import {Suspense} from "react";
import {getRouteLocale} from "@/i18n/server";
import {SITE_NAME, SITE_URL, buildCanonicalUrl} from "@/lib/metadata";
import {getTranslations} from 'next-intl/server';
import {toOgLocale} from '@/i18n/locale-utils';
import {routing} from '@/i18n/routing';
import {HeroSection} from "@/components/aura/hero-section";
import {StatsSection} from "@/components/aura/stats-section";
import {FeaturedCategoryTabs} from "@/components/aura/featured-category-tabs";
import {WhyChooseUsSection} from "@/components/aura/why-choose-us-section";
import {ProcessSection} from "@/components/aura/process-section";
import {ProductionGallerySection} from "@/components/aura/production-gallery-section";
import {TestimonialWidget} from "@/components/aura/testimonial-widget";
import {ConsultationWidget} from "@/components/aura/consultation-widget";
import {FAQSection} from "@/components/aura/faq-section";
import {NewsSection} from "@/components/aura/news-section";
import {FloatingButtons} from "@/components/aura/floating-buttons";

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Home'});
    const ogLocale = toOgLocale(locale);

    return {
        title: {
            absolute: `${SITE_NAME} - ${t('pageTitle')}`,
        },
        description: t('description'),
        alternates: {
            canonical: buildCanonicalUrl("/"),
            languages: Object.fromEntries(routing.locales.map((l) => [l, buildCanonicalUrl(`/${l}`)])),
        },
        openGraph: {
            title: `${SITE_NAME} - ${t('pageTitle')}`,
            description: t('ogDescription'),
            type: "website",
            locale: ogLocale,
            url: SITE_URL,
        },
    };
}

export default async function Home() {
    return (
        <div className="min-h-screen">
            <HeroSection />
            <main className="max-w-[1400px] mx-auto p-4 md:p-6 lg:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-auto">
                <StatsSection />
                <Suspense>
                    <FeaturedCategoryTabs />
                </Suspense>
                <WhyChooseUsSection />
                <ProcessSection />
                <ProductionGallerySection />
                <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                    <TestimonialWidget />
                    <ConsultationWidget />
                </div>
                <FAQSection />
                <NewsSection />
            </main>
            <FloatingButtons />
        </div>
    );
}
