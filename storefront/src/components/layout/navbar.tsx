import Image from "next/image";
import { NavigationLink } from "@/components/shared/navigation-link";
import { NavbarCart } from "@/components/layout/navbar/navbar-cart";
import { ThemeSwitcher } from "@/components/layout/navbar/theme-switcher";
import { NavProducts } from "@/components/layout/navbar/nav-products";
import { ActiveNavLink } from "@/components/layout/navbar/active-nav-link";
import { MobileNavWrapper } from "@/components/layout/navbar/mobile-nav-wrapper";
import { Suspense } from "react";
import { SearchInput } from "@/components/layout/search-input";
import { SearchInputSkeleton } from "@/components/shared/skeletons/search-input-skeleton";
import { Phone } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { getRouteLocale } from "@/i18n/server";
import { getPublicSettings, getStringSetting } from "@/lib/public-settings";

export async function Navbar() {
  const [locale, settings] = await Promise.all([
    getRouteLocale(),
    getPublicSettings(),
  ]);
  const storePhone = getStringSetting(settings, "store_phone");
  const t = await getTranslations({ locale, namespace: "Navigation" });
  const contactItems = Array.from({ length: 12 }, (_, index) => index);

  return (
    <header className="sticky top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 lg:px-10">
        <div className="flex items-center justify-between h-14 sm:h-16 lg:h-20 gap-2 sm:gap-4">
          {/* Left: logo, primary links, then menu */}
          <div className="flex items-center gap-2 sm:gap-4 lg:gap-6 min-w-0">
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <Image
                src="/logo.png"
                alt="Minh An Uniform"
                width={120}
                height={32}
                className="h-7 w-[105px] lg:h-8 lg:w-[120px] object-contain"
                priority
              />
            </Link>
            <nav className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              <ActiveNavLink
                href="/"
                className="hidden sm:inline-flex hover:text-foreground transition whitespace-nowrap"
              >
                {t("home")}
              </ActiveNavLink>
              <Suspense
                fallback={
                  <NavigationLink
                    href="/search"
                    className="inline-flex hover:text-foreground transition whitespace-nowrap"
                  >
                    {t("products")}
                  </NavigationLink>
                }
              >
                <NavProducts />
              </Suspense>
              <ActiveNavLink
                href="/ve-chung-toi"
                className="hidden md:inline-flex hover:text-foreground transition whitespace-nowrap"
              >
                {t("about")}
              </ActiveNavLink>
              <ActiveNavLink
                href="/tin-tuc"
                className="hidden md:inline-flex hover:text-foreground transition whitespace-nowrap"
              >
                {t("news")}
              </ActiveNavLink>
              <ActiveNavLink
                href="/tra-cuu-don-hang"
                className="hidden xl:inline-flex hover:text-foreground transition whitespace-nowrap"
              >
                {t("orderLookup")}
              </ActiveNavLink>
            </nav>
            <Suspense>
              <MobileNavWrapper locale={locale} />
            </Suspense>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-1 sm:gap-3 lg:gap-5 shrink-0">
            {storePhone && (
              <a
                href={`tel:${storePhone.replace(/[^0-9+]/g, "")}`}
                className="hidden xl:flex items-center gap-2.5 rounded-xl bg-primary px-5 py-2.5 text-sm font-extrabold tracking-wide text-primary-foreground shadow-md shadow-primary/25 transition hover:bg-primary/90 hover:shadow-lg"
              >
                <Phone className="size-4" /> {storePhone}
              </a>
            )}
            <div className="hidden xl:block">
              <Suspense fallback={<SearchInputSkeleton />}>
                <SearchInput />
              </Suspense>
            </div>
            <div className="hidden min-[420px]:block">
              <Suspense>
                <ThemeSwitcher />
              </Suspense>
            </div>
            <Suspense>
              <NavbarCart />
            </Suspense>
          </div>
        </div>
      </div>
      <marquee
        behavior="scroll"
        direction="left"
        scrollamount={6}
        className="block border-t border-primary/20 bg-foreground pb-1.5 text-amber-300"
      >
        {contactItems.map((item) => (
          <span key={item} className="mr-5 whitespace-nowrap text-[10px] font-extrabold uppercase tracking-[0.16em] sm:mr-8 sm:text-[11px]">
            Liên hệ trực tiếp <span className="ml-5 text-amber-400/70 sm:ml-8">✦</span>
          </span>
        ))}
      </marquee>
    </header>
  );
}
