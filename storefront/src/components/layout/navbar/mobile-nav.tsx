'use client';

import {useEffect, useState} from 'react';
import { Link, useRouter } from '@/i18n/navigation';
import {Menu, Search, ShoppingBag} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {
    Sheet,
    SheetTrigger,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetClose,
} from '@/components/ui/sheet';
import {useTranslations} from 'next-intl';

interface Collection {
    id: string;
    name: string;
    slug: string;
}

interface MobileNavProps {
    collections: Collection[];
}

export function MobileNav({collections}: MobileNavProps) {
    const t = useTranslations('Navigation');
    const [mounted, setMounted] = useState(false);
    const [open, setOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchValue.trim()) return;
        router.push(`/search?q=${encodeURIComponent(searchValue.trim())}`);
        setOpen(false);
    };

    const handleLinkClick = () => {
        setOpen(false);
    };

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <Button variant="ghost" size="icon" className="shrink-0" disabled>
                <Menu className="size-5" />
                <span className="sr-only">{t('openMenu')}</span>
            </Button>
        );
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger render={<Button variant="ghost" size="icon" className="shrink-0" />}>
                <Menu className="size-5" />
                <span className="sr-only">{t('openMenu')}</span>
            </SheetTrigger>
            <SheetContent side="left" className="w-full sm:max-w-sm overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>{t('menu')}</SheetTitle>
                </SheetHeader>

                <div className="flex flex-col gap-6 px-4 pb-6">
                    {/* Search */}
                    <form onSubmit={handleSearch} className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder={t('searchProducts')}
                            className="pl-9 w-full"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                        />
                    </form>

                    {/* Primary navigation */}
                    <nav className="flex flex-col gap-0.5">
                        {[
                            {href: '/', label: t('home')},
                            {href: '/search', label: t('products')},
                            {href: '/dich-vu', label: t('services')},
                            {href: '/ve-chung-toi', label: t('about')},
                            {href: '/tin-tuc', label: t('news')},
                            {href: '/tra-cuu-don-hang', label: t('orderLookup')},
                        ].map((item) => (
                            <SheetClose
                                key={item.href}
                                render={
                                    <Link
                                        href={item.href}
                                        className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md hover:bg-accent transition-colors"
                                    />
                                }
                                nativeButton={false}
                                onClick={handleLinkClick}
                            >
                                {item.href === '/search' && <ShoppingBag className="h-5 w-5" />}
                                {item.label}
                            </SheetClose>
                        ))}
                    </nav>

                    {/* Collections */}
                    {collections.length > 0 && (
                        <div>
                            <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                {t('collections')}
                            </p>
                            <nav className="flex flex-col gap-0.5">
                                {collections.map((collection) => (
                                    <SheetClose
                                        key={collection.slug}
                                        render={
                                            <Link
                                                href={`/collection/${collection.slug}`}
                                                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md hover:bg-accent transition-colors"
                                            />
                                        }
                                        nativeButton={false}
                                        onClick={handleLinkClick}
                                    >
                                        {collection.name}
                                    </SheetClose>
                                ))}
                            </nav>
                        </div>
                    )}

                </div>
            </SheetContent>
        </Sheet>
    );
}
