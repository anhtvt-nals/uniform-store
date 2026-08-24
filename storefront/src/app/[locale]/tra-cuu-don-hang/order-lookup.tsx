'use client';

import { FormEvent, useState } from 'react';
import { Loader2, PackageSearch, Search } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type LookupOrder = {
  code: string;
  status: string;
  createdAt: string;
  currencyCode: string;
  total: number;
  customerName: string;
  shippingAddress: {
    streetLine1: string;
    streetLine2: string;
    city: string;
    province: string;
    postalCode: string;
  } | null;
  items: Array<{
    id: string;
    productName: string;
    variantName: string;
    quantity: number;
    linePrice: number;
    thumbnailUrl: string | null;
  }>;
};

const statusLabels: Record<string, string> = {
  pending: 'Đã tiếp nhận',
  confirmed: 'Đã xác nhận',
  processing: 'Đang xử lý',
  shipped: 'Đang giao hàng',
  delivered: 'Đã giao hàng',
  cancelled: 'Đã huỷ',
  refunded: 'Đã hoàn tiền',
};

function formatPrice(value: number, currencyCode: string) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: currencyCode || 'VND',
    maximumFractionDigits: 0,
  }).format(value);
}

export function OrderLookup() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [order, setOrder] = useState<LookupOrder | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setOrder(null);
    setMessage('');
    setHasSearched(false);

    try {
      const params = new URLSearchParams({ email: email.trim(), code: code.trim() });
      const response = await fetch(`/api/v1/orders/lookup?${params}`);
      const payload = await response.json();

      if (!response.ok || !payload.success || !payload.data) {
        setMessage(payload?.error?.message || 'Không tìm thấy đơn hàng phù hợp.');
        return;
      }

      setOrder(payload.data as LookupOrder);
    } catch {
      setMessage('Không thể tra cứu đơn hàng lúc này. Vui lòng thử lại.');
    } finally {
      setHasSearched(true);
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-10 md:py-14">
      <div className="mx-auto max-w-xl text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <PackageSearch className="h-6 w-6" />
        </div>
        <h1 className="font-category-title text-3xl tracking-tight text-foreground md:text-4xl">Tra cứu đơn hàng</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Nhập email đã đặt hàng và mã đơn để xem tình trạng xử lý.
        </p>
      </div>

      <Card className="mx-auto mt-8 max-w-xl">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="lookup-email">Email đặt hàng</Label>
              <Input
                id="lookup-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="email@doanhnghiep.vn"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lookup-code">Mã đơn hàng</Label>
              <Input
                id="lookup-code"
                value={code}
                onChange={(event) => setCode(event.target.value.toUpperCase())}
                placeholder="MA-20260824-XXXXXXXX"
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
              Tra cứu đơn hàng
            </Button>
          </form>
        </CardContent>
      </Card>

      {hasSearched && !order && (
        <Card className="mx-auto mt-6 max-w-xl border-destructive/30 bg-destructive/[0.03]">
          <CardContent className="py-6 text-center">
            <p className="font-medium text-foreground">Không tìm thấy đơn hàng</p>
            <p className="mt-1 text-sm text-muted-foreground">{message || 'Vui lòng kiểm tra lại email và mã đơn hàng.'}</p>
          </CardContent>
        </Card>
      )}

      {order && (
        <div className="mx-auto mt-8 max-w-3xl space-y-5">
          <Card>
            <CardHeader className="flex-row items-center justify-between gap-4 space-y-0">
              <div>
                <CardTitle className="text-lg">Đơn hàng {order.code}</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Ngày đặt: {new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium' }).format(new Date(order.createdAt))}
                </p>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
                {statusLabels[order.status] ?? order.status}
              </span>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Sản phẩm đặt hàng</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 border-b border-border pb-4 last:border-0 last:pb-0">
                  <div className="flex min-w-0 items-center gap-3">
                    {item.thumbnailUrl ? (
                      <Image
                        src={item.thumbnailUrl}
                        alt={item.productName}
                        width={64}
                        height={64}
                        className="h-16 w-16 shrink-0 rounded-lg border border-border object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground">
                        <PackageSearch className="h-5 w-5" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-medium">{item.productName}</p>
                      {item.variantName && <p className="mt-1 truncate text-sm text-muted-foreground">{item.variantName}</p>}
                      <p className="mt-1 text-sm text-muted-foreground">Số lượng: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="shrink-0 font-semibold">{formatPrice(item.linePrice, order.currencyCode)}</p>
                </div>
              ))}
              <div className="flex justify-between border-t border-border pt-4 text-lg font-bold">
                <span>Tổng cộng</span>
                <span className="text-primary">{formatPrice(order.total, order.currencyCode)}</span>
              </div>
            </CardContent>
          </Card>

          {order.shippingAddress && (
            <Card>
              <CardHeader><CardTitle className="text-lg">Thông tin liên hệ</CardTitle></CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground">{order.customerName}</p>
                <p className="mt-1">{[order.shippingAddress.streetLine1, order.shippingAddress.streetLine2].filter(Boolean).join(', ')}</p>
                <p>{[order.shippingAddress.city, order.shippingAddress.province, order.shippingAddress.postalCode].filter(Boolean).join(', ')}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
