"use client"

import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { apiClient, getToken } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pagination } from "@/components/shared/pagination"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, Mail, Phone, MapPin, Calendar, ShoppingBag } from "lucide-react"
import { format } from "date-fns"
import { useState } from "react"
import Link from "next/link"

type CustomerDetail = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  emailVerified?: boolean;
  avatarUrl?: string;
  createdAt: string;
  orderCount?: number;
  totalSpent?: number;
};

type Order = {
  id: string;
  code: string;
  status: string;
  grandTotal: number;
  createdAt: string;
};

type Address = {
  id: string;
  fullName: string;
  streetLine1: string;
  city: string;
  countryCode: string;
  isDefaultShipping?: boolean;
};

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const token = getToken();
  const [orderPage, setOrderPage] = useState(1);

  const { data: customer, isLoading, isError, error } = useQuery({
    queryKey: ["customer", id],
    queryFn: () => apiClient<CustomerDetail>(`/customers/${id}`, { token }),
    select: (res) => res.data,
    enabled: !!id,
  });

  const { data: ordersData } = useQuery({
    queryKey: ["customer", id, "orders", orderPage],
    queryFn: () => apiClient<{ items: Order[]; total: number; page: number; totalPages: number }>(
      `/customers/${id}/orders`, { params: { page: orderPage, limit: 10 }, token }
    ),
    select: (res) => res.data,
    enabled: !!id,
  });

  const { data: addresses } = useQuery({
    queryKey: ["customer", id, "addresses"],
    queryFn: () => apiClient<Address[]>(`/customers/${id}/addresses`, { token }),
    select: (res) => res.data,
    enabled: !!id,
  });

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-48 w-full" /><Skeleton className="h-48 w-full" /></div>;
  if (isError) return <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-4 text-destructive"><AlertCircle className="h-4 w-4" />{(error as Error).message}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{customer?.firstName} {customer?.lastName}</h1>
        <p className="text-muted-foreground text-sm">Customer details</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contact Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" /> {customer?.email}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" /> {customer?.phone || "—"}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Joined {customer?.createdAt ? format(new Date(customer.createdAt), "dd/MM/yyyy") : "—"}
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Email verified: </span>
              <Badge variant={customer?.emailVerified ? "success" : "secondary"}>
                {customer?.emailVerified ? "Yes" : "No"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              {customer?.orderCount || 0} orders
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Total spent: </span>
              <span className="font-medium">
                {customer?.totalSpent
                  ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(customer.totalSpent)
                  : "—"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Addresses</CardTitle>
        </CardHeader>
        <CardContent>
          {addresses && addresses.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {addresses.map((addr) => (
                <div key={addr.id} className="rounded-md border p-3 text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">{addr.fullName}</p>
                      <p className="text-muted-foreground">{addr.streetLine1}</p>
                      <p className="text-muted-foreground">{addr.city}, {addr.countryCode}</p>
                      {addr.isDefaultShipping && <Badge variant="secondary" className="mt-1">Default Shipping</Badge>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No addresses on file.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Order History</CardTitle>
        </CardHeader>
        <CardContent>
          {ordersData && ordersData.items.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ordersData.items.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="font-medium">
                        <Link href={`/orders/${o.id}`} className="hover:underline">{o.code}</Link>
                      </TableCell>
                      <TableCell><Badge variant={o.status === "delivered" ? "success" : o.status === "cancelled" ? "destructive" : "secondary"}>{o.status}</Badge></TableCell>
                      <TableCell className="text-right">{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(o.grandTotal)}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">{format(new Date(o.createdAt), "dd/MM/yyyy")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Pagination page={ordersData.page} totalPages={ordersData.totalPages} totalItems={ordersData.total} onPageChange={setOrderPage} />
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No orders yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
