import {getTranslations} from 'next-intl/server';
import {getRouteLocale} from '@/i18n/server';
import {Building, Shirt, Clock} from 'lucide-react';

export async function StatsSection() {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Home'});

    const cards = [
        {
            title: t('stats.customers'),
            value: "5,000+",
            sub: t('stats.customersSub'),
            accent: "text-primary",
            icon: <Building className="w-5 h-5 sm:w-7 sm:h-7" />,
        },
        {
            title: t('stats.produced'),
            value: "2M+",
            sub: t('stats.producedSub'),
            accent: "text-sky-600",
            icon: <Shirt className="w-5 h-5 sm:w-7 sm:h-7" />,
        },
        {
            title: t('stats.experience'),
            value: "24/7",
            sub: t('stats.experienceSub'),
            accent: "text-emerald-600",
            icon: <Clock className="w-5 h-5 sm:w-7 sm:h-7" />,
        },
        {
            title: t('stats.retention'),
            value: "98%",
            sub: t('stats.retentionSub'),
            accent: "text-primary",
            icon: <CircleChart />,
            featured: true,
        },
    ];

    return (
        <div className="md:col-span-12 grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mt-2">
            {cards.map((card, i) => (
                <div
                    key={i}
                    className={`relative flex flex-col justify-between overflow-hidden rounded-xl border bg-background p-3 sm:p-4 shadow-sm transition-all hover:-translate-y-1 ${card.featured ? 'border-primary/40 shadow-primary/10' : 'border-border'}`}
                >
                    <div>
                        <h3 className="mb-2 sm:mb-3 text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.1em] sm:tracking-[0.12em] text-foreground/70">{card.title}</h3>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl sm:text-4xl font-black tracking-tighter text-foreground">{card.value}</span>
                        </div>
                        <div className="mt-1 text-[9px] sm:text-xs font-semibold text-muted-foreground">{card.sub}</div>
                    </div>
                    <div className={`z-10 mt-2.5 sm:mt-4 flex w-full justify-end ${card.accent}`}>{card.icon}</div>
                </div>
            ))}
        </div>
    );
}

function CircleChart({className}: {className?: string}) {
    return (
        <svg className={`w-5 h-5 sm:w-7 sm:h-7 ${className || 'text-muted-foreground'}`} viewBox="0 0 36 36">
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.25" />
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="100" strokeDashoffset="2" strokeLinecap="round" />
        </svg>
    );
}
