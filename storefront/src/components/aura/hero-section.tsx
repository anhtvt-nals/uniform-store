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

type FeaturedProduct = {
    id: string;
    slug: string;
    name: Record<string, string>;
    description?: Record<string, string>;
    images?: Array<{url?: string}>;
};

function getLocalizedText(value: Record<string, string>, locale: string) {
    return value[locale] || value.vi || value.en || Object.values(value)[0] || '';
}

async function getFeaturedProducts(): Promise<FeaturedProduct[]> {
    const backendUrl = (process.env.VENDURE_SHOP_API_URL || 'http://localhost:3000/shop-api').replace('/shop-api', '');
    try {
        const response = await fetch(`${backendUrl}/api/v1/products/featured?limit=4`, {cache: 'no-store'});
        if (!response.ok) return [];
        const payload: unknown = await response.json();
        const data = typeof payload === 'object' && payload !== null && 'data' in payload ? (payload as {data: unknown}).data : payload;
        if (!Array.isArray(data)) return [];
        return data.filter((item): item is FeaturedProduct =>
            typeof item === 'object' && item !== null &&
            typeof (item as FeaturedProduct).id === 'string' &&
            typeof (item as FeaturedProduct).slug === 'string' &&
            typeof (item as FeaturedProduct).name === 'object' &&
            (item as FeaturedProduct).name !== null &&
            !Array.isArray((item as FeaturedProduct).name),
        );
    } catch {
        return [];
    }
}

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
    const fallbackSlides: HeroSlide[] = slideTexts.map((slide, index) => ({
        tag: slide.tag,
        title: slide.title,
        titleHighlight: '',
        desc: slide.desc,
        image: slideImages[index % slideImages.length],
    }));
    const products = await getFeaturedProducts();
    const slides = products.length > 0
        ? products.map((product, index) => ({
            tag: 'Sản phẩm nổi bật',
            title: getLocalizedText(product.name, locale),
            titleHighlight: '',
            desc: getLocalizedText(product.description || {}, locale),
            image: product.images?.[0]?.url || slideImages[index % slideImages.length],
        }))
        : await getHeroSlides(locale, fallbackSlides);

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
        <div className="relative flex flex-col justify-between overflow-hidden rounded-[24px] bg-primary p-5 text-primary-foreground shadow-lg md:col-span-12 md:rounded-[32px] md:p-8 lg:col-span-4">
            <div className="absolute top-0 right-0 translate-x-4 -translate-y-4 p-4 opacity-20 md:p-8"><BoxIcon /></div>
            <div className="relative z-10">
                <div className="mb-5 flex items-center justify-between md:mb-8"><div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-primary-foreground/70 md:gap-2 md:text-[10px] md:tracking-widest"><BoxIconSmall /> {home('bulkOrderTitle')}</div></div>
                <div className="relative flex flex-col gap-3 md:gap-4">
                    <div className="rounded-xl border border-primary-foreground/10 bg-primary-foreground/10 p-4 backdrop-blur-sm md:rounded-2xl md:p-5">
                        <div className="mb-1 text-[9px] font-bold uppercase tracking-wider text-primary-foreground/60 md:text-[10px] md:tracking-widest">{home('bulkOrderEstimate')}</div>
                        <div className="text-2xl font-black tracking-tighter md:text-4xl">{home('bulkOrderNote')}</div>
                        <div className="mt-1 text-sm font-bold text-amber-200 md:text-base">{home('bulkOrderContact')}</div>
                    </div>
                    <div className="mt-1 space-y-1.5 rounded-xl border border-primary-foreground/10 bg-primary-foreground/10 p-4 backdrop-blur-sm md:mt-2 md:space-y-2 md:rounded-2xl md:p-5">
                        {[home('bulkOrderFreeDesign'), home('bulkOrderFreeShip'), home('bulkOrderWarranty'), home('bulkOrderWarranty3Month')].map((benefit) => <div key={benefit} className="flex items-center gap-2 md:gap-3"><CheckCircle2 className="size-3.5 text-green-300 md:size-4" /><span className="text-xs font-bold md:text-sm">{benefit}</span></div>)}
                    </div>
                </div>
            </div>
            <div className="mt-5 w-full md:mt-6"><QuoteButton variant="hero" /></div>
        </div>
    );
}

function BoxIcon() { return <svg className="size-20 text-primary-foreground md:size-32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" /></svg>; }
function BoxIconSmall() { return <svg className="size-3.5 md:size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9-5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" /></svg>; }
