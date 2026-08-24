import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
    locales: ['vi'],
    defaultLocale: 'vi',
    localePrefix: 'never'
});

export type Locale = (typeof routing.locales)[number];

export const localeNames: Record<Locale, string> = {
    vi: 'Tiếng Việt',
};
