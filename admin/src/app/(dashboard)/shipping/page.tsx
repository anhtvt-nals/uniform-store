"use client"

import { useQuery } from "@tanstack/react-query"
import { apiClient, getToken } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

export default function ShippingPage() {
  const token = getToken();

  const { data, isLoading } = useQuery({
    queryKey: ["shipping-methods"],
    queryFn: () => apiClient<{ id: string; name: Record<string, string>; code: string; price: number }[]>("/shipping-methods", { token }),
    select: (res) => res.data,
  });

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold tracking-tight">Shipping Methods</h1><p className="text-muted-foreground text-sm">Configure shipping options</p></div>
      <Card>
        <CardContent className="p-0">
          {isLoading ? <div className="p-4 space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
          : data && data.length > 0 ? (
            <Table>
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Code</TableHead><TableHead className="text-right">Price</TableHead></TableRow></TableHeader>
              <TableBody>{data.map((m) => (
                <TableRow key={m.id}><TableCell className="font-medium">{m.name?.en || m.code}</TableCell><TableCell className="text-muted-foreground">{m.code}</TableCell><TableCell className="text-right">{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(m.price)}</TableCell></TableRow>
              ))}</TableBody>
            </Table>
          ) : <p className="text-sm text-muted-foreground text-center py-8">No shipping methods.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
