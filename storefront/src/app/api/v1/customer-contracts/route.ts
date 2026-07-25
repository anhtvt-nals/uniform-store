import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_API_URL || 'http://localhost:3000';

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/customer-contracts`, {
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 60, tags: ['customer-contracts'] },
    });
    if (!res.ok) return NextResponse.json([], { status: 200 });
    const json = await res.json();
    return NextResponse.json(json.data || json);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
