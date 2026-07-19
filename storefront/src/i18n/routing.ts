import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
    locales: ['vi', 'en', 'de'],
    defaultLocale: 'en',
    localePrefix: 'always'
});

export type Locale = (typeof routing.locales)[number];

export const localeNames: Record<Locale, string> = {
    vi: 'Tiếng Việt',
    en: 'English',
    de: 'Deutsch',
};
