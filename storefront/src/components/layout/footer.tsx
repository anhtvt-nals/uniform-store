import {getRouteLocale} from '@/i18n/server';
import {getTopCollections} from '@/lib/vendure/cached';
import Image from "next/image";
import {NavigationLink} from '@/components/shared/navigation-link';
import {getTranslations} from 'next-intl/server';
import {MapPin, Phone, Mail} from "lucide-react";

const COPYRIGHT_YEAR = 2026;

async function Copyright() {

    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Footer'});

    return (
        <span>&copy; {COPYRIGHT_YEAR} {t('copyright')}</span>
    )
}

export async function Footer() {

    const locale = await getRouteLocale();

    const t = await getTranslations({locale, namespace: 'Footer'});
    const collections = await getTopCollections(locale);

    return (
        <footer className="bg-background border-t border-border/60 mt-16 py-12 px-6 lg:px-10">
            <div className="max-w-[1200px] mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-10 gap-y-10">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1">
                        <Image
                            src="/logo.jpeg"
                            alt="Minh An Uniform"
                            width={100}
                            height={28}
                            className="h-7 w-auto object-contain mb-4"
                        />
                        <p className="text-xs text-muted-foreground/70 leading-relaxed max-w-[220px]">
                            {t('description')}
                        </p>
                    </div>

                    {/* Categories */}
                    <div>
                        <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-4">
                            {t('categories')}
                        </h4>
                        <ul className="space-y-2.5 text-sm text-muted-foreground/80">
                            {collections.map((collection) => (
                                <li key={collection.id}>
                                    <NavigationLink
                                        href={`/collection/${collection.slug}`}
                                        className="hover:text-foreground transition-colors duration-150"
                                    >
                                        {collection.name}
                                    </NavigationLink>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Services */}
                    <div>
                        <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-4">
                            {t('services')}
                        </h4>
                        <ul className="space-y-2.5 text-sm text-muted-foreground/80">
                            <li><span className="hover:text-foreground cursor-pointer transition-colors duration-150">{t('serviceCustomDesign')}</span></li>
                            <li><span className="hover:text-foreground cursor-pointer transition-colors duration-150">{t('servicePrintEmbroidery')}</span></li>
                            <li><span className="hover:text-foreground cursor-pointer transition-colors duration-150">{t('serviceMaterialConsult')}</span></li>
                            <li><span className="hover:text-foreground cursor-pointer transition-colors duration-150">{t('serviceAgencyQuote')}</span></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-4">
                            {t('contact')}
                        </h4>
                        <ul className="space-y-3 text-sm text-muted-foreground/80">
                            <li className="flex items-start gap-2.5">
                                <MapPin className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0 mt-0.5" />
                                <span className="text-xs">{t('address')}</span>
                            </li>
                            <li className="flex items-center gap-2.5">
                                <Phone className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
                                <span className="text-xs">090 123 4567</span>
                            </li>
                            <li className="flex items-center gap-2.5">
                                <Mail className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
                                <span className="text-xs">contact@minhanuniform.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="border-t border-border/40 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-muted-foreground/60">
                    <Copyright />
                    <div className="flex flex-wrap gap-x-5 gap-y-1 justify-center">
                        <span className="hover:text-foreground/80 cursor-pointer transition-colors duration-150">{t('warrantyPolicy')}</span>
                        <span className="hover:text-foreground/80 cursor-pointer transition-colors duration-150">{t('returnPolicy')}</span>
                        <span className="hover:text-foreground/80 cursor-pointer transition-colors duration-150">{t('shippingPolicy')}</span>
                        <span className="hover:text-foreground/80 cursor-pointer transition-colors duration-150">{t('terms')}</span>
                        <span className="hover:text-foreground/80 cursor-pointer transition-colors duration-150">{t('privacyPolicy')}</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
