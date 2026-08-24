import {cookies} from 'next/headers';

const AUTH_TOKEN_COOKIE = process.env.VENDURE_AUTH_TOKEN_COOKIE || 'vendure-auth-token';
const CART_SESSION_COOKIE = 'uniform-cart-session';

export async function setAuthToken(token: string) {
    const cookieStore = await cookies();
    cookieStore.set(AUTH_TOKEN_COOKIE, token);
}

export async function getAuthToken(): Promise<string | undefined> {
    const cookieStore = await cookies();
    return cookieStore.get(AUTH_TOKEN_COOKIE)?.value;
}

export async function removeAuthToken() {
    const cookieStore = await cookies();
    cookieStore.delete(AUTH_TOKEN_COOKIE);
}

export async function getCartSessionId(): Promise<string | undefined> {
    const cookieStore = await cookies();
    return cookieStore.get(CART_SESSION_COOKIE)?.value;
}

export async function ensureCartSessionId(): Promise<string> {
    const cookieStore = await cookies();
    const existingSessionId = cookieStore.get(CART_SESSION_COOKIE)?.value;

    if (existingSessionId) {
        return existingSessionId;
    }

    const sessionId = crypto.randomUUID();
    cookieStore.set(CART_SESSION_COOKIE, sessionId, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
    });
    return sessionId;
}

export async function clearCartSessionId() {
    const cookieStore = await cookies();
    cookieStore.set(CART_SESSION_COOKIE, '', {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 0,
    });
}
