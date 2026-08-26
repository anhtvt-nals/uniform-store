'use server';

import { mutate } from '@/lib/vendure/api';
import { AddToCartMutation } from '@/lib/vendure/mutations';
import { updateTag } from 'next/cache';
import { ensureCartSessionId, getAuthToken, setAuthToken } from '@/lib/auth';
import { getActiveCurrencyCode } from '@/lib/currency-server';
import { getLocale, getTranslations } from 'next-intl/server';

export async function addToCart(variantId: string, quantity: number = 1, sizeId?: string) {
  const locale = await getLocale();
  const currencyCode = await getActiveCurrencyCode();
  const t = await getTranslations({locale, namespace: 'Errors'});

  try {
    const sessionId = await ensureCartSessionId();
    if (sizeId) {
      const shopApiUrl = process.env.VENDURE_SHOP_API_URL || process.env.NEXT_PUBLIC_VENDURE_SHOP_API_URL;
      if (!shopApiUrl) throw new Error('Shop API URL is not configured');
      const token = await getAuthToken();
      const response = await fetch(new URL('/api/v1/cart/items', shopApiUrl).toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(sessionId ? {'x-session-id': sessionId} : {}),
          ...(token ? {Authorization: `Bearer ${token}`} : {}),
        },
        body: JSON.stringify({variantId, productId: '', quantity, sizeId}),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => null) as {message?: string} | null;
        return {success: false, error: payload?.message || t('failedAddToCart')};
      }
      updateTag('cart'); updateTag('active-order');
      return {success: true};
    }
    const result = await mutate(AddToCartMutation, { variantId, quantity }, { useAuthToken: true, currencyCode, sessionId });

    if (result.token) {
      await setAuthToken(result.token);
    }

    if (result.data.addItemToOrder.__typename === 'Order') {
      // Revalidate cart data across all pages
      updateTag('cart');
      updateTag('active-order');
      return { success: true, order: result.data.addItemToOrder };
    } else {
      return { success: false, error: result.data.addItemToOrder.message };
    }
  } catch {
    return { success: false, error: t('failedAddToCart') };
  }
}
