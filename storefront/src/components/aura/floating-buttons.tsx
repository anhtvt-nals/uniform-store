"use client";

import {MessageCircle, PhoneCall} from 'lucide-react';

export function FloatingButtons() {
    return (
        <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
            <button className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition group relative">
                <MessageCircle className="w-6 h-6" />
                <span className="absolute right-14 bg-background text-foreground text-xs font-bold px-3 py-1.5 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">Chat Messenger</span>
            </button>
            <button className="w-12 h-12 bg-blue-400 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition group relative">
                <MessageCircle className="w-6 h-6" />
                <span className="absolute right-14 bg-background text-foreground text-xs font-bold px-3 py-1.5 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">Chat Zalo</span>
            </button>
            <a href="tel:0901234567" className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition group relative animate-bounce">
                <PhoneCall className="w-6 h-6" />
                <span className="absolute right-14 bg-background text-foreground text-xs font-bold px-3 py-1.5 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">Gọi Ngay</span>
            </a>
        </div>
    );
}
