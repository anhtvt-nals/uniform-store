'use client';

import {useLocale, useTranslations} from 'next-intl';
import {toIntlLocale} from '@/i18n/locale-utils';

interface PriceProps {
    value: number;
    currencyCode?: string;
}

export function Price({value, currencyCode = 'USD'}: PriceProps) {
    const locale = useLocale();
    const t = useTranslations('Product');
    const intlLocale = toIntlLocale(locale);

    if (value === 0) {
        return <>{t('contactForPrice')}</>;
    }

    return (
        <>
            {new Intl.NumberFormat(intlLocale, {
                style: 'currency',
                currency: currencyCode,
            }).format(value / 100)}
        </>
    );
}
