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
        <div className="md:col-span-12 lg:col-span-8 relative w-full min-h-[430px] md:min-h-[520px] rounded-[24px] md:rounded-[32px] overflow-hidden group bg-[#E5E7EB] dark:bg-[#2A2A2D] border border-border shadow-sm flex flex-col justify-start md:justify-end px-4 pb-4 pt-6 md:p-6 lg:p-10">
            {/* Slide images (crossfade) */}
            <div className="absolute bottom-[-12px] right-[-8px] h-44 w-32 rounded-xl border-4 border-background shadow-xl transform rotate-3 overflow-hidden z-0 md:right-[-40px] md:bottom-10 md:h-[500px] md:w-80 md:rounded-2xl md:rotate-6 md:border-8 md:shadow-2xl">
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

            <div className="relative z-20 flex h-full w-full max-w-full flex-col justify-start md:max-w-[60%] md:justify-end lg:max-w-[65%]">
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
                            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-foreground px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-background shadow-sm md:mb-6 md:gap-2 md:px-4 md:py-1.5 md:text-[10px] md:tracking-widest">
                                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                {s.tag}
                            </div>
                        )}

                        <h1 className="mb-3 py-1 text-[1.625rem] font-black italic leading-[1.1] tracking-[-0.045em] whitespace-pre-line bg-gradient-to-br from-foreground via-foreground to-primary bg-clip-text text-transparent drop-shadow-sm md:mb-5 md:text-[2.25rem] lg:text-[2.75rem]">
                            {s.title.replace(/\\n/g, '\n')}
                            {s.titleHighlight && <><span>{"\n"}</span><span className="text-primary">{s.titleHighlight}</span></>}
                        </h1>
                        <p className="mb-4 max-w-md text-xs font-medium leading-relaxed text-muted-foreground md:mb-6 md:text-base">
                            {s.desc}
                        </p>

                        <div className="mb-4 grid grid-cols-2 gap-1.5 text-[9px] font-bold text-foreground sm:mb-8 sm:flex sm:flex-wrap sm:items-center sm:gap-4 sm:text-xs">
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

                <div className="mb-4 flex flex-wrap items-center gap-1.5 pointer-events-auto sm:mb-8 sm:gap-4">
                    <Link
                        href="/search"
                        className="flex items-center gap-1 rounded-full bg-primary px-3 py-2 text-[9px] font-black uppercase tracking-wide text-primary-foreground shadow-md transition-all duration-300 hover:bg-foreground hover:shadow-xl group sm:gap-2 sm:px-10 sm:py-5 sm:text-sm sm:tracking-widest"
                    >
                        {ctaShopNow} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform sm:w-5 sm:h-5" />
                    </Link>
                    <Link
                        href="/search"
                        className="flex items-center gap-1 rounded-full border border-foreground bg-background px-2.5 py-2 text-[9px] font-bold uppercase tracking-wide text-foreground shadow-sm transition hover:bg-muted sm:gap-2 sm:border-2 sm:px-8 sm:py-4 sm:text-sm sm:tracking-widest"
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
