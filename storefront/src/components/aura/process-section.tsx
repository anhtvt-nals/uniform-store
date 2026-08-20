import {getTranslations} from 'next-intl/server';
import {getRouteLocale} from '@/i18n/server';
import {MessageCircle, PenTool, CheckCircle2, Truck} from 'lucide-react';
import BoxIcon from './box-icon';

export async function ProcessSection() {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Home'});

    const steps = [
        { num: "01", icon: <MessageCircle className="w-6 h-6" />, title: t('process.step1Title'), desc: t('process.step1Desc') },
        { num: "02", icon: <PenTool className="w-6 h-6" />, title: t('process.step2Title'), desc: t('process.step2Desc') },
        { num: "03", icon: <CheckCircle2 className="w-6 h-6" />, title: t('process.step3Title'), desc: t('process.step3Desc') },
        { num: "04", icon: <BoxIcon className="w-6 h-6" />, title: t('process.step4Title'), desc: t('process.step4Desc') },
        { num: "05", icon: <Truck className="w-6 h-6" />, title: t('process.step5Title'), desc: t('process.step5Desc') },
    ];

    return (
        <section className="relative py-20 md:py-28 overflow-hidden bg-gradient-to-b from-primary/5 via-background to-primary/5">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-10 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
            </div>
            <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-10 relative">
                <div className="text-center mb-16">
                    <h2 className="font-category-title text-3xl md:text-4xl text-foreground tracking-tight mb-4">{t('processTitle')}</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">{t('processDesc')}</p>
                </div>

                <div className="relative max-w-6xl mx-auto">
                    <div className="hidden md:block absolute top-[60px] left-[8%] right-[8%] h-0.5 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 z-0" />

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative z-10">
                        {steps.map((step, idx) => (
                            <div key={idx} className="flex flex-col items-center text-center group cursor-default relative">
                                <div className="w-[120px] h-[120px] rounded-full bg-gradient-to-br from-background to-muted/50 border-[6px] border-primary/10 flex items-center justify-center group-hover:border-primary/30 transition-all duration-500 shadow-lg shadow-primary/5 mb-6 relative z-10 group-hover:shadow-primary/20">
                                    <div className="w-[80px] h-[80px] rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors duration-300 group-hover:scale-110">
                                        <div className="text-muted-foreground group-hover:text-primary transition-colors duration-300">
                                            {step.icon}
                                        </div>
                                    </div>
                                    <div className="absolute -top-2 -right-2 w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-black border-4 border-background shadow-lg shadow-primary/20">
                                        {step.num}
                                    </div>
                                </div>

                                <h3 className="font-bold text-foreground mb-2 text-lg">{step.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed px-2">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
