import type { Metadata } from 'next';
import { OrderLookup } from './order-lookup';

export const metadata: Metadata = {
  title: 'Tra cứu đơn hàng',
  description: 'Tra cứu tình trạng đơn hàng Minh An Uniform bằng email và mã đơn hàng.',
  robots: { index: false, follow: false },
};

export default function OrderLookupPage() {
  return <OrderLookup />;
}
