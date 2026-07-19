"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient, getToken } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SearchInput } from "@/components/shared/search-input"
import { Pagination } from "@/components/shared/pagination"
import { EmptyState } from "@/components/shared/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { Select as SelectNative } from "@/components/ui/select"
import { Eye } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

const statusColors: Record<string, "success" | "secondary" | "destructive" | "warning" | "default"> = {
  delivered: "success",
  shipped: "success",
  processing: "warning",
  confirmed: "secondary",
  pending: "secondary",
  cancelled: "destructive",
  refunded: "destructive",
};

type Order = {
  id: string;
  code: string;
  status: string;
  grandTotal: number;
  customer?: { firstName: string; lastName: string; email: string };
  createdAt: string;
};

export default function OrdersPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const token = getToken();

  const params: Record<string, string | number | boolean | undefined> = { page, limit: 20 };
  if (search) params.q = search;
  if (status) params.status = status;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["orders", search, status, page],
    queryFn: () => apiClient<{ items: Order[]; total: number; page: number; totalPages: number }>("/orders", { params, token }),
    select: (res) => res.data,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
        <p className="text-muted-foreground text-sm">Manage customer orders</p>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 max-w-sm"><SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search by code or email..." /></div>
        <SelectNative options={[
          { value: "", label: "All Status" },
          { value: "pending", label: "Pending" },
          { value: "confirmed", label: "Confirmed" },
          { value: "processing", label: "Processing" },
          { value: "shipped", label: "Shipped" },
          { value: "delivered", label: "Delivered" },
          { value: "cancelled", label: "Cancelled" },
          { value: "refunded", label: "Refunded" },
        ]} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} />
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
      ) : isError ? (
        <div className="rounded-md bg-destructive/10 p-4 text-destructive text-sm">Failed to load orders: {(error as Error).message}</div>
      ) : data && data.items.length > 0 ? (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-16">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium">{o.code}</TableCell>
                    <TableCell className="text-muted-foreground">{o.customer ? `${o.customer.firstName} ${o.customer.lastName}` : "—"}</TableCell>
                    <TableCell><Badge variant={statusColors[o.status] || "secondary"}>{o.status}</Badge></TableCell>
                    <TableCell className="text-right">{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(o.grandTotal)}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{format(new Date(o.createdAt), "dd/MM/yyyy HH:mm")}</TableCell>
                    <TableCell><Button variant="ghost" size="icon" asChild><Link href={`/orders/${o.id}`}><Eye className="h-4 w-4" /></Link></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Pagination page={data.page} totalPages={data.totalPages} totalItems={data.total} onPageChange={setPage} />
        </>
      ) : (
        <EmptyState title="No orders found" description={search ? "Try different search terms." : "Orders will appear here when customers place them."} />
      )}
    </div>
  );
}
