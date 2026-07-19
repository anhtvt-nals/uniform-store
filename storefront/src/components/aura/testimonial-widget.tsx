"use client";

import {useTranslations} from 'next-intl';
import {useState, useEffect} from 'react';
import {Star} from 'lucide-react';

export function TestimonialWidget() {
    const t = useTranslations('Home');
    const [currentIdx, setCurrentIdx] = useState(0);

    const testimonials = [
        { text: t('testimonial.text1'), author: t('testimonial.author1'), role: t('testimonial.role1') },
        { text: t('testimonial.text2'), author: t('testimonial.author2'), role: t('testimonial.role2') },
        { text: t('testimonial.text3'), author: t('testimonial.author3'), role: t('testimonial.role3') },
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIdx((p) => (p + 1) % testimonials.length);
        }, 4000);
        return () => clearInterval(timer);
    }, [testimonials.length]);

    return (
        <div className="bg-background rounded-[32px] p-8 border border-border shadow-sm flex flex-col justify-between h-full relative overflow-hidden">
            <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /> {t('testimonialTitle')}
                </div>
                <div className="flex -space-x-3">
                    <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop" className="w-8 h-8 rounded-full border-2 border-background object-cover" alt="Avatar 1" />
                    <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop" className="w-8 h-8 rounded-full border-2 border-background object-cover" alt="Avatar 2" />
                    <div className="w-8 h-8 rounded-full border-2 border-background bg-foreground text-background flex items-center justify-center text-[10px] font-bold z-10">+99</div>
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-center gap-6 relative z-10">
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />)}
                </div>
                <div>
                    <p className="text-sm font-medium text-foreground leading-relaxed italic mb-6">
                        &ldquo;{testimonials[currentIdx].text}&rdquo;
                    </p>
                    <div>
                        <div className="font-black text-sm text-foreground">{testimonials[currentIdx].author}</div>
                        <div className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase mt-1">{testimonials[currentIdx].role}</div>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-8 right-8 flex gap-1.5 z-10">
                {testimonials.map((_, idx) => (
                    <div key={idx} className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentIdx ? 'bg-primary w-4' : 'bg-muted-foreground/30'}`} />
                ))}
            </div>
        </div>
    );
}
