"use client";

import {Menu, PhoneCall, X} from 'lucide-react';
import {useEffect, useState} from 'react';
import {QuoteButton} from '@/components/commerce/quote-button';

function FacebookIcon({className}: {className?: string}) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
    );
}

type Settings = {
    facebook_url?: string;
    zalo_url?: string;
    store_phone?: string;
};

export function FloatingButtons() {
    const [settings, setSettings] = useState<Settings | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        fetch('/api/v1/settings/public')
            .then((res) => res.json())
            .then((data) => {
                const result: Settings = {};
                if (typeof data === 'object' && data !== null) {
                    for (const [key, value] of Object.entries(data)) {
                        if (key === 'store_phone' || key === 'facebook_url' || key === 'zalo_url') {
                            result[key as keyof Settings] = String(value);
                        }
                    }
                }
                setSettings(result);
            })
            .catch(() => {});
    }, []);

    const phone = settings?.store_phone || '0901234567';
    const fbUrl = settings?.facebook_url || 'https://facebook.com/minhanuniform';
    const zaloUrl = settings?.zalo_url || 'https://zalo.me/0901234567';

    const actions = (
        <>
            <a
                href={fbUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-[#1877F2] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition group relative cursor-pointer"
            >
                <FacebookIcon className="w-5 h-5" />
                <span className="pointer-events-none absolute right-14 hidden whitespace-nowrap rounded-lg bg-background px-3 py-1.5 text-xs font-bold text-foreground shadow-md transition group-hover:opacity-100 md:block md:opacity-0">Facebook</span>
            </a>
            <a
                href={zaloUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition group relative border border-gray-200 cursor-pointer"
            >
                <img src="/zalo.webp" alt="Chat Zalo" className="w-6 h-6 object-contain" />
                <span className="pointer-events-none absolute right-14 hidden whitespace-nowrap rounded-lg bg-background px-3 py-1.5 text-xs font-bold text-foreground shadow-md transition group-hover:opacity-100 md:block md:opacity-0">Chat Zalo</span>
            </a>
            <a href={`tel:${phone.replace(/[^0-9+]/g, '')}`} className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition group relative cursor-pointer">
                <PhoneCall className="w-6 h-6" />
                <span className="pointer-events-none absolute right-14 hidden whitespace-nowrap rounded-lg bg-background px-3 py-1.5 text-xs font-bold text-foreground shadow-md transition group-hover:opacity-100 md:block md:opacity-0">Gọi Ngay</span>
            </a>
            <QuoteButton variant="floating" />
        </>
    );

    return (
        <>
            <div className="fixed bottom-6 right-6 z-50 hidden flex-col items-end gap-3 md:flex">
                {actions}
            </div>
            <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3 md:hidden">
                {isOpen && <div className="flex flex-col items-end gap-3">{actions}</div>}
                <button
                    type="button"
                    aria-label={isOpen ? 'Đóng liên hệ nhanh' : 'Mở liên hệ nhanh'}
                    aria-expanded={isOpen}
                    onClick={() => setIsOpen((open) => !open)}
                    className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition hover:scale-105"
                >
                    {isOpen ? <X className="size-6" /> : <Menu className="size-6" />}
                </button>
            </div>
        </>
    );
}
