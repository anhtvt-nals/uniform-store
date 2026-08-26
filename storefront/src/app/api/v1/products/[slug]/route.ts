import {NextRequest, NextResponse} from 'next/server';

const BACKEND_URL = (process.env.VENDURE_SHOP_API_URL || process.env.NEXT_PUBLIC_VENDURE_SHOP_API_URL || 'http://localhost:3000/shop-api').replace('/shop-api', '');

export async function GET(_request: NextRequest, {params}: {params: Promise<{slug: string}>}) {
  const {slug} = await params;
  const response = await fetch(`${BACKEND_URL}/api/v1/products/${encodeURIComponent(slug)}`, {cache: 'no-store'});
  const body = await response.text();
  return new NextResponse(body, {status: response.status, headers: {'Content-Type': response.headers.get('content-type') || 'application/json'}});
}
