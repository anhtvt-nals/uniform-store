import {cache} from 'react';
import {getTopCollections} from '@/lib/vendure/cached';
import {MobileNav} from '@/components/layout/navbar/mobile-nav';

const getCachedTopCollections = cache(getTopCollections);

export async function MobileNavWrapper({locale}: {locale: string}) {
    let collections: {id: string; name: string; slug: string}[] = [];
    try {
        collections = await getCachedTopCollections(locale);
    } catch {
        // API not available yet — render mobile menu without collections
    }

    return <MobileNav collections={collections} />;
}
