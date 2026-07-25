import { NextResponse } from 'next/server';

const BACKEND_URL = (process.env.VENDURE_SHOP_API_URL || 'http://localhost:3000/shop-api').replace('/shop-api', '');

export async function GET() {
    try {
        const res = await fetch(`${BACKEND_URL}/api/v1/settings/public`, {
            headers: { 'Content-Type': 'application/json' },
            cache: 'no-store',
        });
        const json = await res.json();
        return NextResponse.json(json.data ?? json, { status: res.status });
    } catch {
        return NextResponse.json(
            {},
            { status: 200 },
        );
    }
}
