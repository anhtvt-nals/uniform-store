import {getTranslations} from 'next-intl/server';
import {getRouteLocale} from '@/i18n/server';
import {ProductionGalleryClient, type GalleryImage} from './production-gallery-client';

const galleryAssets = [
    {key: 'thiet-ke-cat-rap-dong-phuc.jpg', fallbackSrc: '/production/cutting-room-1.jpg', alt: 'Thợ vận hành máy cắt rập cho mẫu đồng phục'},
    {key: 'cat-vai-dong-phuc.jpg', fallbackSrc: '/production/cutting-room-1.jpg', alt: 'Công đoạn may chi tiết đồng phục'},
    {key: 'day-chuyen-may-dong-phuc-01.jpg', fallbackSrc: '/production/garment-workers-1.jpg', alt: 'Dây chuyền may đồng phục tại xưởng'},
    {key: 'day-chuyen-may-dong-phuc-02.jpg', fallbackSrc: '/production/textile-machine-1.jpg', alt: 'Công nhân vận hành dây chuyền may công nghiệp'},
    {key: 'hoan-thien-dong-phuc.jpg', fallbackSrc: '/production/tailoring-shop-1.jpg', alt: 'Hoàn thiện và kiểm tra chất lượng đồng phục'},
];

const r2PublicUrl = process.env.NEXT_PUBLIC_STORAGE_URL?.replace(/\/+$/, '');
const images: GalleryImage[] = galleryAssets.map(({key, fallbackSrc, alt}) => ({
    src: r2PublicUrl ? `${r2PublicUrl}/production-gallery/${key}` : fallbackSrc,
    alt,
}));

export async function ProductionGallerySection() {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Home'});

    return (
        <div className="md:col-span-12 py-12 border-t border-border mt-8">
            <div className="text-center mb-8">
                <h2 className="font-category-title text-3xl tracking-tighter text-foreground mb-4">{t('galleryTitle')}</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">{t('galleryDesc')}</p>
            </div>
            <ProductionGalleryClient images={images} />
        </div>
    );
}
