const BACKEND_URL = (process.env.VENDURE_SHOP_API_URL || 'http://localhost:3000/shop-api').replace('/shop-api', '');

export type PublicSettings = Record<string, unknown>;

export async function getPublicSettings(): Promise<PublicSettings> {
    try {
        const response = await fetch(`${BACKEND_URL}/api/v1/settings/public`, {cache: 'no-store'});
        if (!response.ok) return {};

        const payload: unknown = await response.json();
        const settings = typeof payload === 'object' && payload !== null && 'data' in payload
            ? (payload as {data: unknown}).data
            : payload;

        return typeof settings === 'object' && settings !== null ? settings as PublicSettings : {};
    } catch {
        return {};
    }
}

export function getStringSetting(settings: PublicSettings, key: string): string | null {
    const value = settings[key];
    return typeof value === 'string' && value.trim() ? value.trim() : null;
}
