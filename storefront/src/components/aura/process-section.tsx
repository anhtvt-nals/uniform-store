import {getTranslations} from 'next-intl/server';
import {getRouteLocale} from '@/i18n/server';
import {MessageCircle, PenTool, CheckCircle2, Truck} from 'lucide-react';
import BoxIcon from './box-icon';

export async function ProcessSection() {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Home'});

    const steps = [
        { num: "01", icon: <MessageCircle className="w-6 h-6" />, title: t('process.step1Title'), time: t('process.step1Time'), desc: t('process.step1Desc') },
        { num: "02", icon: <PenTool className="w-6 h-6" />, title: t('process.step2Title'), time: t('process.step2Time'), desc: t('process.step2Desc') },
        { num: "03", icon: <CheckCircle2 className="w-6 h-6" />, title: t('process.step3Title'), time: t('process.step3Time'), desc: t('process.step3Desc') },
        { num: "04", icon: <BoxIcon className="w-6 h-6" />, title: t('process.step4Title'), time: t('process.step4Time'), desc: t('process.step4Desc') },
        { num: "05", icon: <Truck className="w-6 h-6" />, title: t('process.step5Title'), time: t('process.step5Time'), desc: t('process.step5Desc') },
    ];

    return (
        <div className="md:col-span-12 py-12 bg-background rounded-[32px] border border-border shadow-sm p-8 md:p-12 mb-6">
            <div className="text-center mb-16">
                <h2 className="text-3xl font-black text-foreground tracking-tighter mb-4">{t('processTitle')}</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">{t('processDesc')}</p>
            </div>

            <div className="relative max-w-5xl mx-auto">
                <div className="hidden md:block absolute top-[50px] left-[10%] right-[10%] h-1 bg-muted z-0" />

                <div className="grid grid-cols-1 md:grid-cols-5 gap-y-12 gap-x-6 relative z-10">
                    {steps.map((step, idx) => (
                        <div key={idx} className="flex flex-col items-center text-center group cursor-default relative">
                            <div className="w-[100px] h-[100px] rounded-full bg-background border-[6px] border-muted flex items-center justify-center text-muted-foreground group-hover:border-primary/20 group-hover:text-primary transition-all duration-300 shadow-sm mb-6 relative z-10">
                                <div className="w-[70px] h-[70px] rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                    {step.icon}
                                </div>
                                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center text-[10px] font-black border-4 border-background shadow-sm">
                                    {step.num}
                                </div>
                            </div>

                            <div className="bg-muted text-muted-foreground text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                {step.time}
                            </div>

                            <h3 className="font-bold text-foreground mb-2 text-lg">{step.title}</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed px-2">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
