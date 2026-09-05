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
        <section className="relative py-6 md:py-12 overflow-hidden bg-gradient-to-b from-primary/5 via-background to-primary/5">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-10 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
            </div>
            <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-10 relative">
                <div className="text-center mb-5 md:mb-8">
                    <h2 className="font-category-title text-2xl md:text-3xl text-foreground tracking-tight mb-2 md:mb-3">{t('processTitle')}</h2>
                    <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">{t('processDesc')}</p>
                </div>

                <div className="relative max-w-6xl mx-auto">
                    <div className="hidden md:block absolute top-[48px] left-[8%] right-[8%] h-0.5 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 z-0" />
                    <div aria-hidden="true" className="md:hidden absolute left-[31px] top-[32px] bottom-[32px] w-px bg-gradient-to-b from-primary/20 via-primary/50 to-primary/20 z-0" />

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-5 md:gap-5 relative z-10">
                        {steps.map((step, idx) => (
                            <div key={idx} className="flex items-start gap-3 text-left md:flex-col md:items-center md:gap-0 md:text-center group cursor-default relative">
                                <div className="shrink-0 w-[64px] h-[64px] md:w-[96px] md:h-[96px] rounded-full bg-gradient-to-br from-background to-muted/50 border-[3px] md:border-4 border-primary/10 flex items-center justify-center group-hover:border-primary/30 transition-all duration-500 shadow-lg shadow-primary/5 mb-0 md:mb-4 relative z-10 group-hover:shadow-primary/20">
                                    <div className="w-[42px] h-[42px] md:w-[60px] md:h-[60px] rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors duration-300 group-hover:scale-110 [&>div>svg]:w-4 [&>div>svg]:h-4 md:[&>div>svg]:w-5 md:[&>div>svg]:h-5">
                                        <div className="text-muted-foreground group-hover:text-primary transition-colors duration-300">
                                            {step.icon}
                                        </div>
                                    </div>
                                    <div className="absolute -top-1 -right-1 md:-top-1.5 md:-right-1.5 w-5 h-5 md:w-7 md:h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[8px] md:text-[10px] font-black border-2 md:border-[3px] border-background shadow-lg shadow-primary/20">
                                        {step.num}
                                    </div>
                                </div>

                                <div className="min-w-0 pt-1 md:pt-0">
                                    <h3 className="font-bold text-foreground mb-1 text-sm md:text-base">{step.title}</h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed md:px-1">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
