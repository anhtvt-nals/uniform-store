import {routing, type Locale} from './routing';

const OG_LOCALE_MAP: Record<Locale, string> = { vi: 'vi_VN', en: 'en_US', de: 'de_DE' };
const INTL_LOCALE_MAP: Record<Locale, string> = { vi: 'vi-VN', en: 'en-US', de: 'de-DE' };

export function toOgLocale(locale: string): string {
    return OG_LOCALE_MAP[locale as Locale] || 'vi_VN';
}

export function toIntlLocale(locale: string): string {
    return INTL_LOCALE_MAP[locale as Locale] || 'vi-VN';
}
