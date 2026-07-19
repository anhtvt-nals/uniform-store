import type {Metadata} from "next";
import {getRouteLocale} from "@/i18n/server";
import {SITE_NAME, SITE_URL, buildCanonicalUrl} from "@/lib/metadata";
import {getTranslations} from 'next-intl/server';
import {toOgLocale} from '@/i18n/locale-utils';
import {routing} from '@/i18n/routing';
import {StatsSection} from "@/components/aura/stats-section";
import {TestimonialWidget} from "@/components/aura/testimonial-widget";
import {WhyChooseUsSection} from "@/components/aura/why-choose-us-section";
import {FloatingButtons} from "@/components/aura/floating-buttons";
import {ShieldCheck, Award, Users, Factory} from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'About'});
    const ogLocale = toOgLocale(locale);

    return {
        title: t('title'),
        description: t('desc'),
        alternates: {
            canonical: buildCanonicalUrl(`/${locale}/ve-chung-toi`),
            languages: Object.fromEntries(routing.locales.map((l) => [l, buildCanonicalUrl(`/${l}/ve-chung-toi`)])),
        },
        openGraph: {
            title: `${t('title')} | ${SITE_NAME}`,
            description: t('desc'),
            type: "website",
            locale: ogLocale,
            url: `${SITE_URL}/ve-chung-toi`,
        },
    };
}

export default async function AboutPage() {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'About'});

    const values = [
        {icon: <ShieldCheck className="w-7 h-7 text-primary" />, title: t('values.quality.title'), desc: t('values.quality.desc')},
        {icon: <Award className="w-7 h-7 text-primary" />, title: t('values.reputation.title'), desc: t('values.reputation.desc')},
        {icon: <Users className="w-7 h-7 text-primary" />, title: t('values.team.title'), desc: t('values.team.desc')},
        {icon: <Factory className="w-7 h-7 text-primary" />, title: t('values.facility.title'), desc: t('values.facility.desc')},
    ];

    return (
        <main className="max-w-[1400px] mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-8 mt-16">
            {/* Hero */}
            <div className="bg-background rounded-[32px] p-8 md:p-12 shadow-sm text-center">
                <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tighter mb-4">{t('title')}</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">{t('desc')}</p>
            </div>

            {/* Intro */}
            <div className="bg-background rounded-[32px] p-8 md:p-12 shadow-sm">
                <h2 className="text-2xl md:text-3xl font-black text-foreground tracking-tighter mb-6">{t('storyTitle')}</h2>
                <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
                    {(t.raw('story') as string[]).map((paragraph, i) => (
                        <p key={i}>{paragraph}</p>
                    ))}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <StatsSection />
            </div>

            {/* Core values */}
            <div className="py-8">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-black text-foreground tracking-tighter mb-4">{t('valuesTitle')}</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">{t('valuesDesc')}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {values.map((item, idx) => (
                        <div key={idx} className="bg-background rounded-[24px] p-8 border border-border shadow-sm hover:shadow-md transition-shadow text-center flex flex-col items-center">
                            <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center mb-6">
                                {item.icon}
                            </div>
                            <h3 className="font-bold text-foreground mb-3">{item.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Why choose us */}
            <WhyChooseUsSection />

            {/* Testimonials */}
            <div className="py-8">
                <TestimonialWidget />
            </div>

            <FloatingButtons />
        </main>
    );
}
