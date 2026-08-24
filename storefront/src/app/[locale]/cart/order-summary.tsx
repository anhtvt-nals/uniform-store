'use client';

import { Link } from '@/i18n/navigation';
import {Button} from '@/components/ui/button';
import {Price} from '@/components/commerce/price';
import {useTranslations} from 'next-intl';
import Image from 'next/image';

type ActiveOrder = {
    id: string;
    currencyCode: string;
    subTotalWithTax: number;
    shippingWithTax: number;
    totalWithTax: number;
    discounts?: Array<{
        description: string;
        amountWithTax: number;
    }> | null;
    lines: Array<{
        id: string;
        quantity: number;
        linePriceWithTax: number;
        productVariant: {
            name: string;
            product: {
                name: string;
                slug: string;
                featuredAsset?: { preview: string } | null;
            };
        };
    }>;
};

export function OrderSummary({activeOrder, isSubmitting}: { activeOrder: ActiveOrder; isSubmitting: boolean }) {
    const t = useTranslations('Cart');
    return (
        <div className="border rounded-xl p-6 bg-card sticky top-24 shadow-sm">
            <h2 className="text-xl font-bold mb-4">{t('orderSummary')}</h2>

            <div className="mb-5 space-y-3 border-b border-border pb-5">
                {activeOrder.lines.map((line) => (
                    <div key={line.id} className="flex gap-3">
                        <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                            {line.productVariant.product.featuredAsset ? (
                                <Image
                                    src={line.productVariant.product.featuredAsset.preview}
                                    alt={line.productVariant.name}
                                    fill
                                    className="object-cover"
                                    sizes="48px"
                                />
                            ) : null}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold">{line.productVariant.product.name}</p>
                            {line.productVariant.name !== line.productVariant.product.name && (
                                <p className="truncate text-xs text-muted-foreground">{line.productVariant.name}</p>
                            )}
                            <p className="mt-0.5 text-xs text-muted-foreground">SL: {line.quantity}</p>
                        </div>
                        <Price value={line.linePriceWithTax} currencyCode={activeOrder.currencyCode}/>
                    </div>
                ))}
            </div>

            <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('subtotal')}</span>
                    <span>
                        <Price value={activeOrder.subTotalWithTax} currencyCode={activeOrder.currencyCode}/>
                    </span>
                </div>
                {activeOrder.discounts && activeOrder.discounts.length > 0 && (
                    <>
                        {activeOrder.discounts.map((discount, index) => (
                            <div key={index} className="flex justify-between text-sm text-green-600">
                                <span>{discount.description}</span>
                                <span>
                                    <Price value={discount.amountWithTax} currencyCode={activeOrder.currencyCode}/>
                                </span>
                            </div>
                        ))}
                    </>
                )}
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('shipping')}</span>
                    <span>
                        {activeOrder.shippingWithTax > 0
                            ? <Price value={activeOrder.shippingWithTax} currencyCode={activeOrder.currencyCode}/>
                            : t('calculatedAtCheckout')}
                    </span>
                </div>
            </div>

            <div className="border-t pt-4 mb-6">
                <div className="flex justify-between items-baseline text-lg font-bold">
                    <span>{t('total')}</span>
                    <span className="text-2xl">
                        <Price value={activeOrder.totalWithTax} currencyCode={activeOrder.currencyCode}/>
                    </span>
                </div>
            </div>

            <Button type="submit" form="cart-order-contact" className="w-full" size="lg" disabled={isSubmitting}>Đặt hàng</Button>

            <Button render={<Link href="/" />} nativeButton={false} variant="outline" className="w-full mt-3">{t('continueShopping')}</Button>
        </div>
    );
}
