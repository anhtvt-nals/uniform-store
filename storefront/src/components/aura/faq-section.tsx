"use client";

import {useTranslations} from 'next-intl';
import {useState} from 'react';
import {ArrowRight} from 'lucide-react';
import {Link} from '@/i18n/navigation';

export function FAQSection() {
    const t = useTranslations('Home');
    const [openIdx, setOpenIdx] = useState<number | null>(0);

    const faqs = [
        { q: t('faq.q1'), a: t('faq.a1') },
        { q: t('faq.q2'), a: t('faq.a2') },
        { q: t('faq.q3'), a: t('faq.a3') },
        { q: t('faq.q4'), a: t('faq.a4') },
    ];

    return (
        <div className="md:col-span-12 py-12">
            <div className="flex flex-col md:flex-row gap-12">
                <div className="md:w-1/3">
                    <h2 className="text-3xl font-black text-foreground tracking-tighter mb-4">{t('faqTitle')}</h2>
                    <p className="text-muted-foreground mb-6">{t('faqDesc')}</p>
                    <Link
                        href="/search"
                        className="bg-foreground text-background rounded-full px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-muted-foreground transition shadow-sm items-center gap-2 flex w-fit"
                    >
                        {t('faqCta')} <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
                <div className="md:w-2/3 space-y-4">
                    {faqs.map((faq, idx) => (
                        <div key={idx} className="bg-background border border-border rounded-[24px] overflow-hidden">
                            <button
                                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                                className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                            >
                                <span className="font-bold text-foreground">{faq.q}</span>
                                <span
                                    className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 ml-4 transition-transform duration-300"
                                    style={{ transform: openIdx === idx ? 'rotate(180deg)' : 'rotate(0deg)' }}
                                >
                                    <svg className="w-4 h-4 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </span>
                            </button>
                            {openIdx === idx && (
                                <div className="px-6 pb-5 text-muted-foreground text-sm">{faq.a}</div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
