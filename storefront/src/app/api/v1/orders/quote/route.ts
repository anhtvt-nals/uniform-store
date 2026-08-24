import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = (process.env.VENDURE_SHOP_API_URL || 'http://localhost:3000/shop-api').replace('/shop-api', '');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const sessionId = request.cookies.get('uniform-cart-session')?.value;
    const authToken = request.cookies.get(process.env.VENDURE_AUTH_TOKEN_COOKIE || 'vendure-auth-token')?.value;
    const res = await fetch(`${BACKEND_URL}/api/v1/orders/quote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(sessionId ? {'x-session-id': sessionId} : {}),
        ...(authToken ? {Authorization: `Bearer ${authToken}`} : {}),
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    const response = NextResponse.json(data, {status: res.status});

    if (res.ok) {
      response.cookies.set('uniform-cart-session', '', {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 0,
      });
    }

    return response;
  } catch {
    return NextResponse.json(
      {success: false, error: {message: 'Failed to create order'}},
      {status: 500},
    );
  }
}
