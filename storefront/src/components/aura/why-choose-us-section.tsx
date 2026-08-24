import {getTranslations} from 'next-intl/server';
import {getRouteLocale} from '@/i18n/server';
import {Factory, PenTool, Shirt, Truck} from 'lucide-react';

export async function WhyChooseUsSection() {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Home'});

    const features = [
        { icon: <Shirt className="w-8 h-8 text-primary" />, title: t('features.highQuality.title'), desc: t('features.highQuality.description') },
        { icon: <PenTool className="w-8 h-8 text-primary" />, title: t('features.bestPrices.title'), desc: t('features.bestPrices.description') },
        { icon: <Factory className="w-8 h-8 text-primary" />, title: t('features.closedProduction.title'), desc: t('features.closedProduction.description') },
        { icon: <Truck className="w-8 h-8 text-primary" />, title: t('features.nationwideDelivery.title'), desc: t('features.nationwideDelivery.description') },
    ];

    return (
        <div className="md:col-span-12 py-8 md:py-12">
            <div className="text-center mb-6 md:mb-10">
                <h2 className="font-category-title text-3xl text-foreground tracking-tighter mb-4">{t('whyShopWithUs')}</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">{t('whyShopWithUsDesc')}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
                {features.map((item, idx) => (
                    <div key={idx} className="bg-background rounded-[20px] sm:rounded-[24px] p-4 sm:p-8 border border-border shadow-sm hover:shadow-md transition-shadow text-center flex flex-col items-center">
                        <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-primary/5 flex items-center justify-center mb-3 sm:mb-6 [&>svg]:w-5 [&>svg]:h-5 sm:[&>svg]:w-8 sm:[&>svg]:h-8">
                            {item.icon}
                        </div>
                        <h3 className="text-sm sm:text-base font-bold text-foreground mb-2 sm:mb-3">{item.title}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
