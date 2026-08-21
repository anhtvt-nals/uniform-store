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
        <div className="md:col-span-12 lg:col-span-8 relative w-full min-h-[700px] md:min-h-[520px] rounded-[32px] overflow-hidden group bg-[#E5E7EB] dark:bg-[#2A2A2D] border border-border shadow-sm flex flex-col justify-end p-4 md:p-6 lg:p-10">
            <div className="absolute top-0 right-0 p-6 md:p-10 z-10 pointer-events-none">
                <span className="text-6xl md:text-[120px] font-bold text-foreground/30 leading-none tracking-tighter">FW24</span>
            </div>

            {/* Slide images (crossfade) */}
            <div className="absolute right-[-40px] md:right-[-40px] top-10 md:top-auto md:bottom-10 w-64 md:w-80 h-[400px] md:h-[500px] rounded-2xl transform rotate-6 border-8 border-background shadow-2xl overflow-hidden z-0">
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
            </div>
        </div>
    );
}
