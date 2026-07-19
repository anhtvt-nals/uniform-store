"use client";

import {useTranslations} from 'next-intl';
import {Sparkles, Send} from 'lucide-react';
import {Link} from '@/i18n/navigation';

export function ConsultationWidget() {
    const t = useTranslations('Home');
    return (
        <div className="bg-primary text-primary-foreground rounded-[32px] p-8 flex flex-col justify-between relative overflow-hidden h-full shadow-lg group">
            <div className="absolute top-0 right-[-20px] p-8 opacity-10 transform -rotate-12 group-hover:rotate-0 transition-transform duration-700 ease-out">
                <Sparkles className="w-40 h-40 text-primary-foreground" />
            </div>
            <div className="relative z-10">
                <div className="flex flex-col mb-8 gap-2">
                    <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-primary-foreground/70 uppercase">
                        <Sparkles className="w-4 h-4" /> {t('consultationTitle')}
                    </div>
                    <h3 className="text-3xl font-black tracking-tighter text-primary-foreground mt-2 leading-none">
                        {t('consultationTitle2')}
                    </h3>
                    <p className="text-xs text-primary-foreground/70 mt-3 font-medium max-w-[220px] leading-relaxed">
                        {t('consultationDesc')}
                    </p>
                </div>
            </div>

            <Link
                href="/search"
                className="relative z-10 w-full bg-primary-foreground/10 p-1.5 rounded-full flex items-center backdrop-blur-sm border border-primary-foreground/20 hover:border-primary-foreground transition-colors mt-auto"
            >
                <span className="bg-transparent border-none outline-none text-sm text-primary-foreground px-4 flex-1 w-full pointer-events-none">
                    {t('consultationPlaceholder')}
                </span>
                <span className="w-10 h-10 rounded-full bg-background text-foreground flex items-center justify-center transition shrink-0">
                    <Send className="w-4 h-4 ml-0.5" />
                </span>
            </Link>
        </div>
    );
}
