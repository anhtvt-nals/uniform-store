'use client';

import {useState} from 'react';
import {useTranslations} from 'next-intl';
import {QuoteRequestModal} from './quote-request-modal';

interface QuoteButtonProps {
    variant?: 'navbar' | 'hero' | 'floating' | 'mobile-sticky' | 'inline';
    prefill?: { productType: string; quantity: string };
    compact?: boolean;
}

export function QuoteButton({variant = 'inline', prefill, compact = false}: QuoteButtonProps) {
    const [open, setOpen] = useState(false);
    const t = useTranslations('Home');

    if (variant === 'navbar') {
        return (
            <>
                <button
                    onClick={() => setOpen(true)}
                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-primary/90 transition shadow-lg shadow-primary/20"
                >
                    {t('quoteTitle')}
                </button>
                <QuoteRequestModal open={open} onOpenChange={setOpen} source="navbar" />
            </>
        );
    }

    if (variant === 'floating') {
        return (
            <>
                <button
                    onClick={() => setOpen(true)}
                    className="w-auto h-12 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full flex items-center gap-2 px-4 shadow-[0_4px_20px_rgba(234,88,12,0.4)] hover:scale-110 hover:shadow-[0_6px_25px_rgba(234,88,12,0.55)] transition-all duration-200 ring-2 ring-orange-300/50 hover:ring-orange-200/70"
                >
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
                    </svg>
                    <span className="text-[11px] font-bold uppercase tracking-wider whitespace-nowrap">{t('quoteTitle')}</span>
                </button>
                <QuoteRequestModal open={open} onOpenChange={setOpen} source="floating" />
            </>
        );
    }

    if (variant === 'hero') {
        return (
            <>
                <button
                    onClick={() => setOpen(true)}
                    className={`inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary-foreground px-6 font-bold uppercase tracking-widest text-primary shadow-xl shadow-black/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-foreground/90 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-foreground/50 ${compact ? 'py-2.5 text-[11px]' : 'px-8 py-4 text-sm'}`}
                >
                    {t('quoteBtn')}
                </button>
                <QuoteRequestModal open={open} onOpenChange={setOpen} source="hero" initialProductType={prefill?.productType} initialQuantity={prefill?.quantity} />
            </>
        );
    }

    return (
        <>
            <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-primary/90 transition shadow-lg shadow-primary/20">
                {t('quoteBtn')}
            </button>
            <QuoteRequestModal open={open} onOpenChange={setOpen} source={variant} />
        </>
    );
}
