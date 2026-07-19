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
            bg: "bg-muted",
            text: "text-foreground",
            subText: "text-muted-foreground",
            icon: <Building className="w-10 h-10 text-muted-foreground" />,
        },
        {
            title: t('stats.produced'),
            value: "2M+",
            sub: t('stats.producedSub'),
            bg: "bg-background",
            text: "text-foreground",
            subText: "text-muted-foreground",
            icon: <Shirt className="w-10 h-10 text-muted-foreground" />,
            border: true,
        },
        {
            title: t('stats.experience'),
            value: "10+",
            sub: t('stats.experienceSub'),
            bg: "bg-muted",
            text: "text-foreground",
            subText: "text-muted-foreground",
            icon: <Clock className="w-10 h-10 text-muted-foreground" />,
        },
        {
            title: t('stats.retention'),
            value: "98%",
            sub: t('stats.retentionSub'),
            bg: "bg-foreground",
            text: "text-background",
            subText: "text-muted-foreground",
            icon: <CircleChart />,
        },
    ];

    return (
        <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
            {cards.map((card, i) => (
                <div
                    key={i}
                    className={`${card.bg} rounded-[32px] p-8 flex flex-col justify-between border ${card.border ? 'border-border' : 'border-transparent'} shadow-sm relative overflow-hidden transition-all hover:-translate-y-1`}
                >
                    <div>
                        <h3 className={`text-[10px] font-bold tracking-widest ${card.subText} mb-6 uppercase`}>{card.title}</h3>
                        <div className="flex items-baseline gap-2">
                            <span className={`text-5xl font-black tracking-tighter ${card.text}`}>{card.value}</span>
                        </div>
                        <div className={`text-sm font-semibold ${card.subText} mt-2`}>{card.sub}</div>
                    </div>
                    <div className="z-10 w-full mt-6 flex justify-end">{card.icon}</div>
                </div>
            ))}
        </div>
    );
}

function CircleChart() {
    return (
        <svg className="w-10 h-10 text-muted-foreground" viewBox="0 0 36 36">
            <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
            />
        </svg>
    );
}
