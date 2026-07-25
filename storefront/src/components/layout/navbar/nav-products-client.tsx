'use client';

import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';
import {ChevronDown} from 'lucide-react';
import {useState, useRef, useEffect} from 'react';

interface Collection {
    id: string;
    name: string;
    slug: string;
}

export function NavProductsClient({collections}: {collections: Collection[]}) {
    const t = useTranslations('Navigation');
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={ref} className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
            <Link
                href="/search"
                className="hover:text-foreground transition whitespace-nowrap inline-flex items-center gap-1"
                onMouseEnter={() => setOpen(true)}
            >
                {t('products')}
                <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
            </Link>
            {open && collections.length > 0 && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2">
                    <div className="bg-background border border-border rounded-xl shadow-xl min-w-[200px] py-2">
                            <Link
                                    href="/search"
                                    className="block px-4 py-2 text-[11px] font-bold hover:bg-accent transition"
                                    onClick={() => setOpen(false)}
                                >
                                    {t('shopAll')}
                                </Link>
                                <div className="h-px bg-border mx-3 my-1" />
                                {collections.map((collection) => (
                                    <Link
                                        key={collection.slug}
                                        href={`/collection/${collection.slug}`}
                                        className="block px-4 py-2 text-[11px] font-bold hover:bg-accent transition"
                                        onClick={() => setOpen(false)}
                                    >
                                        {collection.name}
                                    </Link>
                                ))}
                    </div>
                </div>
            )}
        </div>
    );
}
