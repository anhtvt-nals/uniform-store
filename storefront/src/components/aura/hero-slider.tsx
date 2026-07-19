"use client";

import {useState, useEffect, useCallback} from 'react';
import {Link} from '@/i18n/navigation';
import {ArrowRight, FileText, ChevronLeft, ChevronRight, CheckCircle2} from 'lucide-react';

export interface HeroSlide {
    tag: string;
    title: string;
    titleHighlight: string;
    desc: string;
    image: string;
}

export interface HeroTrustBadge {
    title: string;
    desc: string;
    icon: 'shield' | 'pen' | 'truck';
}

interface HeroSliderProps {
    slides: HeroSlide[];
    ctaShopNow: string;
    ctaViewCollections: string;
    badgeCustomers: string;
    badgeProducts: string;
    badgeExperience: string;
    trustBadges: HeroTrustBadge[];
}

function BadgeIcon({icon}: {icon: HeroTrustBadge['icon']}) {
    if (icon === 'shield') return <ShieldIcon />;
    if (icon === 'pen') return <PenIcon />;
    return <TruckIcon />;
}

function ShieldIcon() {
    return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.038A11.969 11.969 0 013.5 5.25v.75A2.25 2.25 0 005.748 8.25c.449 0 .898.066 1.331.193M12 2.25c1.917 0 3.695.62 5.13 1.671a11.969 11.969 0 015.37 1.331c.43.127.879.193 1.331.193A2.25 2.25 0 0124 6v.75a11.969 11.969 0 01-8.25 11.354M12 2.25c-1.917 0-3.695.62-5.13 1.671A11.969 11.969 0 001.5 7.331M3.5 5.25a2.25 2.25 0 00-2.25 2.25v.75A11.969 11.969 0 008.25 18.354" />
        </svg>
    );
}
function PenIcon() {
    return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
        </svg>
    );
}
function TruckIcon() {
    return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
        </svg>
    );
}

export function HeroSlider({
    slides,
    ctaShopNow,
    ctaViewCollections,
    badgeCustomers,
    badgeProducts,
    badgeExperience,
    trustBadges,
}: HeroSliderProps) {
    const [current, setCurrent] = useState(0);
    const count = slides.length;

    const next = useCallback(() => setCurrent((p) => (p + 1) % count), [count]);
    const prev = useCallback(() => setCurrent((p) => (p - 1 + count) % count), [count]);

    useEffect(() => {
        if (count <= 1) return;
        const timer = setInterval(() => setCurrent((p) => (p + 1) % count), 5000);
        return () => clearInterval(timer);
    }, [count]);

    if (count === 0) return null;

    return (
        <div className="md:col-span-12 lg:col-span-8 relative w-full min-h-[700px] md:min-h-[520px] rounded-[32px] overflow-hidden group bg-[#E5E7EB] dark:bg-[#2A2A2D] border border-border shadow-sm flex flex-col justify-end p-4 md:p-6 lg:p-10">
            <div className="absolute top-0 right-0 p-6 md:p-10 z-10 pointer-events-none">
                <span className="text-6xl md:text-[120px] font-bold text-foreground/30 leading-none tracking-tighter">FW24</span>
            </div>

            {/* Slide images (crossfade) */}
            <div className="absolute right-[-40px] md:right-[-40px] top-10 md:top-auto md:bottom-10 w-64 md:w-80 h-[400px] md:h-[500px] rounded-2xl transform rotate-6 border-8 border-background shadow-2xl overflow-hidden z-0">
                {slides.map((s, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        key={i}
                        src={s.image}
                        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
                        style={{opacity: i === current ? 1 : 0}}
                        alt={s.title}
                    />
                ))}
            </div>

            <div className="relative z-20 w-full max-w-2xl flex flex-col justify-end h-full">
                {/* Slide content (crossfade) */}
                {slides.map((s, i) => (
                    <div
                        key={i}
                        className="transition-opacity duration-500"
                        style={{
                            opacity: i === current ? 1 : 0,
                            position: i === current ? 'relative' : 'absolute',
                            inset: i === current ? 'auto' : 0,
                            pointerEvents: i === current ? 'auto' : 'none',
                        }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-foreground text-background text-[10px] uppercase tracking-widest rounded-full mb-6 font-bold shadow-sm">
                            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                            {s.tag}
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-foreground tracking-tighter leading-[1] mb-6 whitespace-pre-line">
                            {s.title}{"\n"}
                            <span className="text-primary">{s.titleHighlight}</span>
                        </h1>
                        <p className="text-muted-foreground font-medium text-sm md:text-base max-w-md mb-6 leading-relaxed">
                            {s.desc}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 mb-8 text-xs font-bold text-foreground">
                            <div className="flex items-center gap-1.5 bg-background/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border">
                                <CheckCircle2 className="w-4 h-4 text-primary" /> {badgeCustomers}
                            </div>
                            <div className="flex items-center gap-1.5 bg-background/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border">
                                <CheckCircle2 className="w-4 h-4 text-primary" /> {badgeProducts}
                            </div>
                            <div className="flex items-center gap-1.5 bg-background/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border">
                                <CheckCircle2 className="w-4 h-4 text-primary" /> {badgeExperience}
                            </div>
                        </div>
                    </div>
                ))}

                <div className="flex flex-wrap items-center gap-4 mb-8 pointer-events-auto">
                    <Link
                        href="/search"
                        className="bg-primary text-primary-foreground rounded-full px-10 py-5 text-sm font-black uppercase tracking-widest hover:bg-foreground transition-all duration-300 shadow-xl hover:shadow-2xl flex items-center gap-2 group"
                    >
                        {ctaShopNow} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                        href="/search"
                        className="bg-background text-foreground border-2 border-foreground rounded-full px-8 py-4 text-sm font-bold uppercase tracking-widest hover:bg-muted transition shadow-sm flex items-center gap-2"
                    >
                        <FileText className="w-4 h-4" /> {ctaViewCollections}
                    </Link>

                    {count > 1 && (
                        <div className="flex gap-2 ml-auto">
                            <button
                                onClick={prev}
                                aria-label="Previous slide"
                                className="w-12 h-12 rounded-full bg-background border border-border flex items-center justify-center hover:bg-muted transition shadow-sm text-foreground z-30 relative"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button
                                onClick={next}
                                aria-label="Next slide"
                                className="w-12 h-12 rounded-full bg-background border border-border flex items-center justify-center hover:bg-muted transition shadow-sm text-foreground z-30 relative"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </div>
                    )}
                </div>

                {count > 1 && (
                    <div className="flex gap-1.5 mb-4 z-30 relative">
                        {slides.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrent(idx)}
                                aria-label={`Go to slide ${idx + 1}`}
                                className={`h-1.5 rounded-full transition-all ${idx === current ? 'bg-primary w-8' : 'bg-muted-foreground/40 w-3 hover:bg-muted-foreground/70'}`}
                            />
                        ))}
                    </div>
                )}

                {/* Trust badges */}
                <div className="bg-background/90 backdrop-blur-xl border border-border rounded-[24px] p-4 lg:p-6 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-0 md:divide-x divide-border shadow-sm pointer-events-auto relative z-30">
                    {trustBadges.map((b, i) => (
                        <div key={i} className="px-4 flex items-center gap-4 justify-center md:justify-start">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                <BadgeIcon icon={b.icon} />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-foreground uppercase tracking-widest">{b.title}</div>
                                <div className="text-[10px] text-muted-foreground mt-1">{b.desc}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
