import {getRouteLocale} from '@/i18n/server';
import {getTopCollections} from '@/lib/vendure/cached';
import {NavProductsClient} from './nav-products-client';

export async function NavProducts() {
    const locale = await getRouteLocale();
    const collections = await getTopCollections(locale);

    return <NavProductsClient collections={collections} />;
}
