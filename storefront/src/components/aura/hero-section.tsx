import {getTranslations} from 'next-intl/server';
import {getRouteLocale} from '@/i18n/server';
import {CheckCircle2} from 'lucide-react';
import {HeroSlider, type HeroSlide} from './hero-slider';
import {QuoteButton} from '@/components/commerce/quote-button';

const slideImages = [
    "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1000&auto=format&fit=crop",
];

async function getHeroSlides(locale: string, fallback: HeroSlide[]): Promise<HeroSlide[]> {
    const backendUrl = (process.env.VENDURE_SHOP_API_URL || 'http://localhost:3000/shop-api').replace('/shop-api', '');
    try {
        const response = await fetch(`${backendUrl}/api/v1/banners?locale=${encodeURIComponent(locale)}`, {cache: 'no-store'});
        if (!response.ok) return fallback;
        const payload: unknown = await response.json();
        const data = typeof payload === 'object' && payload !== null && 'data' in payload ? (payload as {data: unknown}).data : payload;
        if (!Array.isArray(data)) return fallback;
        const slides = data.filter((item): item is {title: string; content: string; image: string} =>
            typeof item === 'object' && item !== null && typeof (item as {title?: unknown}).title === 'string' && typeof (item as {image?: unknown}).image === 'string',
        );
        return slides.length ? slides.map((slide) => ({tag: '', title: slide.title, titleHighlight: '', desc: slide.content, image: slide.image})) : fallback;
    } catch {
        return fallback;
    }
}

export async function HeroSection() {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Hero'});

    const slideTexts = t.raw('slides') as Array<{tag: string; title: string; desc: string}>;
    const fallbackSlides: HeroSlide[] = slideTexts.map((s, i) => ({
        tag: s.tag,
        title: s.title,
        titleHighlight: '',
        desc: s.desc,
        image: slideImages[i % slideImages.length],
    }));
    const slides = await getHeroSlides(locale, fallbackSlides);
    return (
        <div className="max-w-[1400px] mx-auto p-4 md:p-6 lg:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 mt-4">
            <HeroSlider
                slides={slides}
                ctaShopNow={t('shopNow')}
                ctaViewCollections={t('viewCollections')}
                badgeCustomers={t('customers')}
                badgeProducts={t('productsProduced')}
                badgeExperience={t('experience')}
            />
            <BulkOrderWidget />
        </div>
    );
}

async function BulkOrderWidget() {
    const locale = await getRouteLocale();
    const home = await getTranslations({locale, namespace: 'Home'});
    return (
        <div className="md:col-span-12 lg:col-span-4 bg-primary text-primary-foreground rounded-[32px] p-8 flex flex-col justify-between shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-20 transform translate-x-4 -translate-y-4"><BoxIcon /></div>
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-8"><div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-primary-foreground/70 uppercase"><BoxIconSmall /> {home('bulkOrderTitle')}</div></div>
                <div className="flex flex-col gap-4 relative">
                    <div className="bg-primary-foreground/10 rounded-2xl p-5 border border-primary-foreground/10 backdrop-blur-sm">
                        <div className="text-[10px] font-bold text-primary-foreground/60 tracking-widest mb-1 uppercase">{home('bulkOrderEstimate')}</div>
                        <div className="text-4xl font-black tracking-tighter">{home('bulkOrderNote')}</div>
                        <div className="mt-1 text-sm font-bold text-amber-200">{home('bulkOrderContact')}</div>
                    </div>
                    <div className="bg-primary-foreground/10 rounded-2xl p-5 border border-primary-foreground/10 backdrop-blur-sm mt-2 space-y-2">
                        {[home('bulkOrderFreeDesign'), home('bulkOrderFreeShip'), home('bulkOrderWarranty'), home('bulkOrderWarranty3Month')].map((benefit) => <div key={benefit} className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-green-300" /><span className="text-sm font-bold">{benefit}</span></div>)}
                    </div>
                </div>
            </div>
            <div className="mt-6 w-full"><QuoteButton variant="hero" /></div>
        </div>
    );
}

function BoxIcon() { return <svg className="w-32 h-32 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" /></svg>; }
function BoxIconSmall() { return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" /></svg>; }
