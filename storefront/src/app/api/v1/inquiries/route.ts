import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = (process.env.VENDURE_SHOP_API_URL || 'http://localhost:3000/shop-api').replace('/shop-api', '');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const res = await fetch(`${BACKEND_URL}/api/v1/inquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { message: 'Failed to submit inquiry' } },
      { status: 500 },
    );
  }
}
