import {getTranslations} from 'next-intl/server';
import {getRouteLocale} from '@/i18n/server';
import {Shirt, PenTool, CheckCircle2, ShieldCheck} from 'lucide-react';

export async function WhyChooseUsSection() {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Home'});

    const features = [
        { icon: <Shirt className="w-8 h-8 text-primary" />, title: t('features.highQuality.title'), desc: t('features.highQuality.description') },
        { icon: <PenTool className="w-8 h-8 text-primary" />, title: t('features.bestPrices.title'), desc: t('features.bestPrices.description') },
        { icon: <CheckCircle2 className="w-8 h-8 text-primary" />, title: t('features.fastDelivery.title'), desc: t('features.fastDelivery.description') },
        { icon: <ShieldCheck className="w-8 h-8 text-primary" />, title: t('features.warranty.title'), desc: t('features.warranty.description') },
    ];

    return (
        <div className="md:col-span-12 py-12">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-black text-foreground tracking-tighter mb-4">{t('whyShopWithUs')}</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">{t('whyShopWithUsDesc')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {features.map((item, idx) => (
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
    );
}
