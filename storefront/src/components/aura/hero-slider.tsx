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

interface HeroSliderProps {
    slides: HeroSlide[];
    ctaShopNow: string;
    ctaViewCollections: string;
    badgeCustomers: string;
    badgeProducts: string;
    badgeExperience: string;
}

export function HeroSlider({
    slides,
    ctaShopNow,
    ctaViewCollections,
    badgeCustomers,
    badgeProducts,
    badgeExperience,
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
        <div className="md:col-span-12 lg:col-span-8 relative w-full min-h-[500px] md:min-h-[520px] rounded-[32px] overflow-hidden group bg-[#E5E7EB] dark:bg-[#2A2A2D] border border-border shadow-sm flex flex-col justify-start md:justify-end px-4 pb-4 pt-8 md:p-6 lg:p-10">
            {/* Slide images (crossfade) */}
            <div className="absolute right-[-20px] bottom-[-24px] md:right-[-40px] md:bottom-10 w-48 md:w-80 h-64 md:h-[500px] rounded-2xl transform rotate-6 border-8 border-background shadow-2xl overflow-hidden z-0">
                {slides.map((s, i) => (
                    <img
                        key={i}
                        src={s.image}
                        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
                        style={{opacity: i === current ? 1 : 0}}
                        alt={s.title}
                    />
                ))}
            </div>

            <div className="relative z-20 w-full max-w-2xl flex flex-col justify-start md:justify-end h-full">
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
                        {s.tag && (
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-foreground text-background text-[10px] uppercase tracking-widest rounded-full mb-6 font-bold shadow-sm">
                                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                {s.tag}
                            </div>
                        )}

                        <h1 className="py-1 text-[2.125rem] md:text-[2.75rem] lg:text-6xl font-black italic tracking-[-0.06em] leading-[1.12] mb-6 whitespace-pre-line bg-gradient-to-br from-foreground via-foreground to-primary bg-clip-text text-transparent drop-shadow-sm">
                            {s.title.replace(/\\n/g, '\n')}
                            {s.titleHighlight && <><span>{"\n"}</span><span className="text-primary">{s.titleHighlight}</span></>}
                        </h1>
                        <p className="text-muted-foreground font-medium text-sm md:text-base max-w-md mb-6 leading-relaxed">
                            {s.desc}
                        </p>

                        <div className="grid grid-cols-2 gap-2 mb-5 text-[10px] font-bold text-foreground sm:flex sm:flex-wrap sm:items-center sm:gap-4 sm:mb-8 sm:text-xs">
                            <div className="flex items-center gap-1 bg-background/50 backdrop-blur-sm px-2 py-1 rounded-full border border-border sm:gap-1.5 sm:px-3 sm:py-1.5">
                                <CheckCircle2 className="w-3 h-3 text-primary sm:w-4 sm:h-4" /> {badgeCustomers}
                            </div>
                            <div className="flex items-center gap-1 bg-background/50 backdrop-blur-sm px-2 py-1 rounded-full border border-border sm:gap-1.5 sm:px-3 sm:py-1.5">
                                <CheckCircle2 className="w-3 h-3 text-primary sm:w-4 sm:h-4" /> {badgeProducts}
                            </div>
                            <div className="flex items-center gap-1 bg-background/50 backdrop-blur-sm px-2 py-1 rounded-full border border-border sm:col-span-2 sm:gap-1.5 sm:px-3 sm:py-1.5">
                                <CheckCircle2 className="w-3 h-3 text-primary sm:w-4 sm:h-4" /> {badgeExperience}
                            </div>
                        </div>
                    </div>
                ))}

                <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-5 sm:mb-8 pointer-events-auto">
                    <Link
                        href="/search"
                        className="bg-primary text-primary-foreground rounded-full px-5 py-3 text-[11px] font-black uppercase tracking-wider hover:bg-foreground transition-all duration-300 shadow-xl hover:shadow-2xl flex items-center gap-1.5 group sm:px-10 sm:py-5 sm:text-sm sm:tracking-widest sm:gap-2"
                    >
                        {ctaShopNow} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform sm:w-5 sm:h-5" />
                    </Link>
                    <Link
                        href="/search"
                        className="bg-background text-foreground border-2 border-foreground rounded-full px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider hover:bg-muted transition shadow-sm flex items-center gap-1.5 sm:px-8 sm:py-4 sm:text-sm sm:tracking-widest sm:gap-2"
                    >
                        <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> {ctaViewCollections}
                    </Link>

                    {count > 1 && (
                        <div className="flex gap-2 ml-auto">
                            <button
                                onClick={prev}
                                aria-label="Previous slide"
                                className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-background border border-border flex items-center justify-center hover:bg-muted transition shadow-sm text-foreground z-30 relative"
                            >
                                <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
                            </button>
                            <button
                                onClick={next}
                                aria-label="Next slide"
                                className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-background border border-border flex items-center justify-center hover:bg-muted transition shadow-sm text-foreground z-30 relative"
                            >
                                <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" />
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
            </div>
        </div>
    );
}
