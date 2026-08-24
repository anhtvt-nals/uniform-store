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
        <section className="relative py-10 md:py-28 overflow-hidden bg-gradient-to-b from-primary/5 via-background to-primary/5">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-10 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
            </div>
            <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-10 relative">
                <div className="text-center mb-8 md:mb-16">
                    <h2 className="font-category-title text-2xl md:text-4xl text-foreground tracking-tight mb-3 md:mb-4">{t('processTitle')}</h2>
                    <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">{t('processDesc')}</p>
                </div>

                <div className="relative max-w-6xl mx-auto">
                    <div className="hidden md:block absolute top-[60px] left-[8%] right-[8%] h-0.5 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 z-0" />
                    <div aria-hidden="true" className="md:hidden absolute left-[37px] top-[38px] bottom-[38px] w-px bg-gradient-to-b from-primary/20 via-primary/50 to-primary/20 z-0" />

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-5 md:gap-8 relative z-10">
                        {steps.map((step, idx) => (
                            <div key={idx} className="flex items-start gap-4 text-left md:flex-col md:items-center md:gap-0 md:text-center group cursor-default relative">
                                <div className="shrink-0 w-[76px] h-[76px] md:w-[120px] md:h-[120px] rounded-full bg-gradient-to-br from-background to-muted/50 border-4 md:border-[6px] border-primary/10 flex items-center justify-center group-hover:border-primary/30 transition-all duration-500 shadow-lg shadow-primary/5 mb-0 md:mb-6 relative z-10 group-hover:shadow-primary/20">
                                    <div className="w-[48px] h-[48px] md:w-[80px] md:h-[80px] rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors duration-300 group-hover:scale-110 [&>div>svg]:w-4 [&>div>svg]:h-4 md:[&>div>svg]:w-6 md:[&>div>svg]:h-6">
                                        <div className="text-muted-foreground group-hover:text-primary transition-colors duration-300">
                                            {step.icon}
                                        </div>
                                    </div>
                                    <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 w-6 h-6 md:w-9 md:h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[9px] md:text-xs font-black border-2 md:border-4 border-background shadow-lg shadow-primary/20">
                                        {step.num}
                                    </div>
                                </div>

                                <div className="min-w-0 pt-1 md:pt-0">
                                    <h3 className="font-bold text-foreground mb-1 md:mb-2 text-sm md:text-lg">{step.title}</h3>
                                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed md:px-2">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
