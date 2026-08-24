"use client";

import {useTranslations} from 'next-intl';
import {useState, useEffect} from 'react';
import {Star} from 'lucide-react';

export type Testimonial = {id: string; text: string; author: string; role: string; avatarUrl: string; rating: number};

export function TestimonialWidget({testimonials: suppliedTestimonials}: {testimonials?: Testimonial[]}) {
    const t = useTranslations('Home');
    const [currentIdx, setCurrentIdx] = useState(0);
    const testimonials = suppliedTestimonials ?? [
        {id: 'translation-1', text: t('testimonial.text1'), author: t('testimonial.author1'), role: t('testimonial.role1'), avatarUrl: '', rating: 5},
        {id: 'translation-2', text: t('testimonial.text2'), author: t('testimonial.author2'), role: t('testimonial.role2'), avatarUrl: '', rating: 5},
        {id: 'translation-3', text: t('testimonial.text3'), author: t('testimonial.author3'), role: t('testimonial.role3'), avatarUrl: '', rating: 5},
    ];
    const current = testimonials[currentIdx] ?? testimonials[0];

    useEffect(() => {
        if (testimonials.length === 0) return;
        const timer = setInterval(() => {
            setCurrentIdx((p) => (p + 1) % testimonials.length);
        }, 4000);
        return () => clearInterval(timer);
    }, [testimonials.length]);

    if (!current) return null;

    return (
        <div className="bg-background rounded-[32px] p-8 border border-border shadow-sm flex flex-col justify-between h-full relative overflow-hidden">
            <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /> {t('testimonialTitle')}
                </div>
                <div className="flex -space-x-3">
                    {testimonials.slice(0, 2).map((testimonial) => testimonial.avatarUrl ? (
                        <img key={testimonial.id} src={testimonial.avatarUrl} className="w-8 h-8 rounded-full border-2 border-background object-cover" alt={testimonial.author} />
                    ) : (
                        <div key={testimonial.id} className="flex w-8 h-8 items-center justify-center rounded-full border-2 border-background bg-muted text-[10px] font-bold text-muted-foreground">{testimonial.author.slice(0, 1)}</div>
                    ))}
                    {testimonials.length > 2 && <div className="w-8 h-8 rounded-full border-2 border-background bg-foreground text-background flex items-center justify-center text-[10px] font-bold z-10">+{testimonials.length - 2}</div>}
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-center gap-6 relative z-10">
                <div className="flex gap-1">
                    {Array.from({length: current.rating}, (_, i) => <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />)}
                </div>
                <div>
                    <p className="text-sm font-medium text-foreground leading-relaxed italic mb-6">
                        &ldquo;{current.text}&rdquo;
                    </p>
                    <div>
                        <div className="font-black text-sm text-foreground">{current.author}</div>
                        <div className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase mt-1">{current.role}</div>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-8 right-8 flex gap-1.5 z-10">
                {testimonials.map((testimonial, idx) => (
                    <div key={testimonial.id} className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentIdx ? 'bg-primary w-4' : 'bg-muted-foreground/30'}`} />
                ))}
            </div>
        </div>
    );
}
