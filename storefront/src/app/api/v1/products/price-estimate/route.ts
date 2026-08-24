import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = (process.env.VENDURE_SHOP_API_URL || 'http://localhost:3000/shop-api').replace('/shop-api', '');

export async function GET(request: NextRequest) {
  const params = new URLSearchParams({
    categorySlug: request.nextUrl.searchParams.get('categorySlug') ?? '',
    quantity: request.nextUrl.searchParams.get('quantity') ?? '',
  });
  const response = await fetch(`${BACKEND_URL}/api/v1/products/price-estimate?${params}`, { cache: 'no-store' });
  const payload = await response.json();
  return NextResponse.json(payload, { status: response.status });
}
