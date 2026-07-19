import {query} from './api';
import {GetActiveChannelQuery, GetAvailableCountriesQuery, GetTopCollectionsQuery} from './queries';

export async function getActiveChannelCached() {
    const result = await query(GetActiveChannelQuery);
    return result.data.activeChannel;
}

export async function getAvailableCountriesCached(locale: string) {
    const result = await query(GetAvailableCountriesQuery, undefined, {languageCode: locale});
    return result.data.availableCountries || [];
}

export async function getTopCollections(locale: string) {
    const result = await query(GetTopCollectionsQuery, undefined, {languageCode: locale});
    return result.data.collections.items;
}
