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
import {TestimonialWidget, type Testimonial} from "@/components/aura/testimonial-widget";
import {ConsultationWidget} from "@/components/aura/consultation-widget";
import {FAQSection} from "@/components/aura/faq-section";
import {NewsSection} from "@/components/aura/news-section";
import {CustomerContractsSection} from "@/components/aura/customer-contracts-section";

async function getTestimonials(locale: string, fallback: Testimonial[]): Promise<Testimonial[]> {
    const backendUrl = (process.env.VENDURE_SHOP_API_URL || 'http://localhost:3000/shop-api').replace('/shop-api', '');
    try {
        const response = await fetch(`${backendUrl}/api/v1/testimonials?locale=${encodeURIComponent(locale)}`, {cache: 'no-store'});
        if (!response.ok) return fallback;
        const payload: unknown = await response.json();
        const data = typeof payload === 'object' && payload !== null && 'data' in payload ? (payload as {data: unknown}).data : payload;
        return Array.isArray(data) ? data.filter((item): item is Testimonial =>
            typeof item === 'object' && item !== null && typeof (item as Testimonial).id === 'string' && typeof (item as Testimonial).text === 'string',
        ) : fallback;
    } catch {
        return fallback;
    }
}

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
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Home'});
    const testimonials = await getTestimonials(locale, [
        {id: 'fallback-1', text: t('testimonial.text1'), author: t('testimonial.author1'), role: t('testimonial.role1'), avatarUrl: '', rating: 5},
        {id: 'fallback-2', text: t('testimonial.text2'), author: t('testimonial.author2'), role: t('testimonial.role2'), avatarUrl: '', rating: 5},
        {id: 'fallback-3', text: t('testimonial.text3'), author: t('testimonial.author3'), role: t('testimonial.role3'), avatarUrl: '', rating: 5},
    ]);
    return (
        <div className="min-h-screen">
            <HeroSection />
            <main className="max-w-[1400px] mx-auto mt-1 p-3 md:mt-0 md:p-6 lg:p-8 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 auto-rows-auto">
                <StatsSection />
                <Suspense>
                    <FeaturedCategoryTabs />
                </Suspense>
                <WhyChooseUsSection />
            </main>
            <ProcessSection />
            <Suspense>
                <CustomerContractsSection locale={locale} />
            </Suspense>
            <main className="max-w-[1400px] mx-auto p-3 md:p-6 lg:p-8 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 auto-rows-auto">
                <ProductionGallerySection />
                <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-1 md:mt-2">
                    <TestimonialWidget testimonials={testimonials} />
                    <ConsultationWidget />
                </div>
                <FAQSection />
                <NewsSection />
            </main>
        </div>
    );
}
