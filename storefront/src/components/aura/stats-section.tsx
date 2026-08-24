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
            icon: <Building className="w-6 h-6 sm:w-10 sm:h-10" />,
        },
        {
            title: t('stats.produced'),
            value: "2M+",
            sub: t('stats.producedSub'),
            accent: "text-sky-600",
            icon: <Shirt className="w-6 h-6 sm:w-10 sm:h-10" />,
        },
        {
            title: t('stats.experience'),
            value: "24/7",
            sub: t('stats.experienceSub'),
            accent: "text-emerald-600",
            icon: <Clock className="w-6 h-6 sm:w-10 sm:h-10" />,
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
        <div className="md:col-span-12 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mt-4">
            {cards.map((card, i) => (
                <div
                    key={i}
                    className={`relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-background p-3 sm:p-6 shadow-sm transition-all hover:-translate-y-1 ${card.featured ? 'border-primary/40 shadow-primary/10' : 'border-border'}`}
                >
                    <div>
                        <h3 className="mb-3 sm:mb-6 text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.12em] sm:tracking-widest text-foreground/70">{card.title}</h3>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl sm:text-5xl font-black tracking-tighter text-foreground">{card.value}</span>
                        </div>
                        <div className="mt-1 sm:mt-2 text-[10px] sm:text-sm font-semibold text-muted-foreground">{card.sub}</div>
                    </div>
                    <div className={`z-10 mt-3 sm:mt-6 flex w-full justify-end ${card.accent}`}>{card.icon}</div>
                </div>
            ))}
        </div>
    );
}

function CircleChart({className}: {className?: string}) {
    return (
        <svg className={`w-6 h-6 sm:w-10 sm:h-10 ${className || 'text-muted-foreground'}`} viewBox="0 0 36 36">
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.25" />
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="100" strokeDashoffset="2" strokeLinecap="round" />
        </svg>
    );
}
