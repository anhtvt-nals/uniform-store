import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = (process.env.VENDURE_SHOP_API_URL || 'http://localhost:3000/shop-api').replace('/shop-api', '');

export async function GET(request: NextRequest) {
  const search = new URLSearchParams({
    code: request.nextUrl.searchParams.get('code') ?? '',
    email: request.nextUrl.searchParams.get('email') ?? '',
  });

  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/orders/lookup?${search}`, {
      cache: 'no-store',
    });
    const payload = await response.json();
    return NextResponse.json(payload, { status: response.status });
  } catch {
    return NextResponse.json(
      { success: false, error: { message: 'Không thể tra cứu đơn hàng lúc này.' } },
      { status: 502 },
    );
  }
}
