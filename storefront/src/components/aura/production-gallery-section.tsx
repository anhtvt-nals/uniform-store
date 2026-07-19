import {getTranslations} from 'next-intl/server';
import {getRouteLocale} from '@/i18n/server';
import {ProductionGalleryClient, type GalleryImage} from './production-gallery-client';

const images: GalleryImage[] = [
    {src: '/production/garment-workers-1.jpg', alt: 'Công nhân xưởng may'},
    {src: '/production/textile-machine-1.jpg', alt: 'Máy may công nghiệp'},
    {src: '/production/cutting-room-1.jpg', alt: 'Phòng cắt vải'},
    {src: '/production/fabric-rolls-1.jpg', alt: 'Kho vải nguyên liệu'},
    {src: '/production/tailoring-shop-1.jpg', alt: 'Xưởng may đo'},
];

export async function ProductionGallerySection() {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Home'});

    return (
        <div className="md:col-span-12 py-12 border-t border-border mt-8">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-black tracking-tighter text-foreground mb-4">{t('galleryTitle')}</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">{t('galleryDesc')}</p>
            </div>
            <ProductionGalleryClient images={images} />
        </div>
    );
}
