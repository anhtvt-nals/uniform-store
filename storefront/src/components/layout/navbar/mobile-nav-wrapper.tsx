import {cache} from 'react';
import {getTopCollections} from '@/lib/vendure/cached';
import {MobileNav} from '@/components/layout/navbar/mobile-nav';

const getCachedTopCollections = cache(getTopCollections);

export async function MobileNavWrapper({locale}: {locale: string}) {
    const collections = await getCachedTopCollections(locale);

    return <MobileNav collections={collections} />;
}
