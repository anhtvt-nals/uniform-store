import Image from "next/image";
import {NavigationLink} from '@/components/shared/navigation-link';
import {NavbarCart} from '@/components/layout/navbar/navbar-cart';
import {NavbarUser} from '@/components/layout/navbar/navbar-user';
import {ThemeSwitcher} from '@/components/layout/navbar/theme-switcher';
import {LanguagePicker} from '@/components/layout/navbar/language-picker';
import {CurrencyPickerWrapper} from '@/components/layout/navbar/currency-picker-wrapper';
import {MobileNavWrapper} from '@/components/layout/navbar/mobile-nav-wrapper';
import {Suspense} from "react";
import {SearchInput} from '@/components/layout/search-input';
import {NavbarUserSkeleton} from '@/components/shared/skeletons/navbar-user-skeleton';
import {SearchInputSkeleton} from '@/components/shared/skeletons/search-input-skeleton';
import {Phone} from "lucide-react";
import {Link} from '@/i18n/navigation';
import {getTranslations} from "next-intl/server";
import {getRouteLocale} from "@/i18n/server";

export async function Navbar() {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Navigation'});

    const navLinks = [
        {href: "/", label: t('home'), active: true},
        {href: "/search", label: t('products')},
        {href: "/dich-vu", label: t('services')},
        {href: "/ve-chung-toi", label: t('about')},
        {href: "/tin-tuc", label: t('news')},
    ];

    return (
        <header className="sticky top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
            <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-10">
                <div className="flex items-center justify-between h-16 lg:h-20 gap-4">
                    {/* Left: mobile menu + logo + desktop nav */}
                    <div className="flex items-center gap-6 lg:gap-10 min-w-0">
                        <Suspense>
                            <MobileNavWrapper />
                        </Suspense>
                        <Link href="/" className="flex items-center gap-2 shrink-0">
                            <Image
                                src="/logo.jpeg"
                                alt="Minh An Uniform"
                                width={120}
                                height={32}
                                className="h-7 lg:h-8 w-auto object-contain"
                                priority
                            />
                        </Link>
                        <nav className="hidden xl:flex items-center gap-7 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                            {navLinks.map((item, i) => (
                                <NavigationLink
                                    key={i}
                                    href={item.href}
                                    className="hover:text-foreground transition whitespace-nowrap"
                                >
                                    {item.label}
                                </NavigationLink>
                            ))}
                        </nav>
                    </div>

                    {/* Right: actions */}
                    <div className="flex items-center gap-3 lg:gap-5 shrink-0">
                        <div className="hidden 2xl:flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full font-bold text-xs uppercase tracking-widest">
                            <Phone className="w-4 h-4" /> 090 123 4567
                        </div>
                        <div className="hidden xl:block">
                            <Suspense fallback={<SearchInputSkeleton />}>
                                <SearchInput/>
                            </Suspense>
                        </div>
                        <div className="hidden md:flex items-center gap-1">
                            <Suspense>
                                <LanguagePicker />
                            </Suspense>
                            <Suspense>
                                <CurrencyPickerWrapper />
                            </Suspense>
                        </div>
                        <Suspense>
                            <ThemeSwitcher />
                        </Suspense>
                        <Suspense>
                            <NavbarCart/>
                        </Suspense>
                        <Suspense fallback={<NavbarUserSkeleton />}>
                            <NavbarUser/>
                        </Suspense>
                    </div>
                </div>
            </div>
        </header>
    );
}
