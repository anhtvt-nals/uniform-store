"use client"

import { useParams, useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient, getToken } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select as SelectNative } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
  { value: "refunded", label: "Refunded" },
];

const statusColors: Record<string, "success" | "secondary" | "destructive" | "warning" | "default"> = {
  delivered: "success", shipped: "success", processing: "warning",
  confirmed: "secondary", pending: "secondary", cancelled: "destructive", refunded: "destructive",
};

type OrderDetail = {
  id: string;
  code: string;
  status: string;
  grandTotal: number;
  subtotal: number;
  shippingTotal: number;
  discountTotal: number;
  taxTotal: number;
  currencyCode: string;
  customer?: { id: string; email: string; firstName: string; lastName: string };
  items: { id: string; productName: Record<string, string>; variantName: Record<string, string>; sku: string; quantity: number; unitPrice: number; linePrice: number }[];
  shippingAddress?: { fullName: string; streetLine1: string; city: string; countryCode: string };
  createdAt: string;
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const token = getToken();

  const { data: order, isLoading, isError, error } = useQuery({
    queryKey: ["order", id],
    queryFn: () => apiClient<OrderDetail>(`/orders/${id}`, { token }),
    select: (res) => res.data,
    enabled: !!id,
  });

  const statusMutation = useMutation({
    mutationFn: (status: string) => apiClient(`/orders/${id}/status`, { method: "PATCH", body: { status }, token }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["order", id] }); queryClient.invalidateQueries({ queryKey: ["orders"] }); toast.success("Status updated"); },
    onError: (err: Error) => toast.error(err.message),
  });

  const fmt = (v: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v);

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-96 w-full" /></div>;
  if (isError) return <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-4 text-destructive"><AlertCircle className="h-4 w-4" />{(error as Error).message}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/orders")}><ArrowLeft className="h-4 w-4" /></Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{order?.code}</h1>
          <p className="text-muted-foreground text-sm">Order details</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={statusColors[(order as OrderDetail)?.status || ""] || "secondary"} className="text-sm px-3 py-1">
            {(order as OrderDetail)?.status}
          </Badge>
          <SelectNative
            options={[{ value: "", label: "Change status..." }, ...statusOptions]}
            value=""
            onChange={(e) => { if (e.target.value) statusMutation.mutate(e.target.value); }}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Customer</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-1">
            <p className="font-medium">{order?.customer?.firstName} {order?.customer?.lastName}</p>
            <p className="text-muted-foreground">{order?.customer?.email}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Shipping Address</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-1">
            {order?.shippingAddress ? (
              <>
                <p className="font-medium">{order.shippingAddress.fullName}</p>
                <p className="text-muted-foreground">{order.shippingAddress.streetLine1}</p>
                <p className="text-muted-foreground">{order.shippingAddress.city}, {order.shippingAddress.countryCode}</p>
              </>
            ) : <p className="text-muted-foreground">No address</p>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Items</CardTitle></CardHeader>
        <CardContent>
          {order?.items && order.items.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Variant</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.productName?.en || item.productName?.vi}</TableCell>
                    <TableCell>{item.variantName?.en || item.variantName?.vi}</TableCell>
                    <TableCell className="text-muted-foreground">{item.sku}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">{fmt(item.unitPrice)}</TableCell>
                    <TableCell className="text-right font-medium">{fmt(item.linePrice)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : <p className="text-sm text-muted-foreground">No items</p>}
          <div className="mt-4 space-y-1 text-sm border-t pt-4">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{fmt(order?.subtotal || 0)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{fmt(order?.shippingTotal || 0)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span>-{fmt(order?.discountTotal || 0)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>{fmt(order?.taxTotal || 0)}</span></div>
            <div className="flex justify-between font-semibold text-base border-t pt-2">
              <span>Total</span><span>{fmt(order?.grandTotal || 0)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">Created: {order?.createdAt ? format(new Date(order.createdAt), "dd/MM/yyyy HH:mm") : "—"}</p>
    </div>
  );
}
