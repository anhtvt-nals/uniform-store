"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { usePathname } from "@/i18n/navigation";
import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface Collection {
  id: string;
  name: string;
  slug: string;
}

export function NavProductsClient({
  collections,
}: {
  collections: Collection[];
}) {
  const t = useTranslations("Navigation");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openMenu = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setOpen(true);
  };

  const scheduleClose = () => {
    closeTimerRef.current = setTimeout(() => setOpen(false), 180);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="relative hidden sm:block"
      onMouseEnter={openMenu}
      onMouseLeave={scheduleClose}
    >
      <Link
        href="/search"
        className={`hover:text-foreground transition whitespace-nowrap inline-flex items-center gap-1 ${pathname === '/search' || pathname.startsWith('/collection/') || pathname.startsWith('/product/') ? 'text-primary' : ''}`}
        onMouseEnter={openMenu}
      >
        {t("products")}
        <ChevronDown
          className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </Link>
      {open && collections.length > 0 && (
        <div
          className="fixed inset-x-0 top-16 z-50 border-y border-border bg-background/95 shadow-xl backdrop-blur-md lg:top-20"
          onMouseEnter={openMenu}
          onMouseLeave={scheduleClose}
        >
          <div className="mx-auto max-w-[1400px] px-6 py-5 lg:px-10">
            <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-foreground">
                Danh mục sản phẩm
              </p>
              <Link
                href="/search"
                className="text-[10px] font-bold text-primary hover:underline"
                onClick={() => setOpen(false)}
              >
                {t("shopAll")} →
              </Link>
            </div>
            <nav className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {collections.map((collection) => (
                <Link
                  key={collection.slug}
                  href={`/collection/${collection.slug}`}
                  className="rounded-lg border border-transparent bg-muted/40 px-3 py-2.5 text-[11px] font-bold text-foreground transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                  onClick={() => setOpen(false)}
                >
                  {collection.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
