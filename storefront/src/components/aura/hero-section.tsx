import {getTranslations} from 'next-intl/server';
import {getRouteLocale} from '@/i18n/server';
import {HeroSlider, type HeroSlide} from './hero-slider';
import {HeroConfigurator} from './hero-configurator';
import {getTopCollections} from '@/lib/vendure/cached';

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
    let categories: Array<{id: string; name: string; slug: string}> = [];
    try {
        categories = (await getTopCollections(locale)).map((category) => ({id: category.id, name: category.name, slug: category.slug}));
    } catch {
        categories = [
            {id: 'polo', name: 'Đồng phục áo Polo', slug: 'dong-phuc-ao-polo'},
            {id: 'office', name: 'Đồng phục công sở', slug: 'dong-phuc-cong-so'},
            {id: 'hotel', name: 'Đồng phục khách sạn', slug: 'dong-phuc-khach-san'},
        ];
    }

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
            <HeroConfigurator categories={categories} />
        </div>
    );
}
