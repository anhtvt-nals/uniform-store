"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { apiClient, getToken } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs } from "@/components/ui/tabs"

export default function PromotionsPage() {
  const token = getToken();

  const { data: discounts, isLoading: dl } = useQuery({
    queryKey: ["discounts"],
    queryFn: () => apiClient<unknown[]>("/discounts", { token }),
    select: (res) => res.data as { id: string; name: Record<string, string>; type: string; value: number }[],
  });

  const { data: coupons, isLoading: cl } = useQuery({
    queryKey: ["coupons"],
    queryFn: () => apiClient<unknown[]>("/coupons", { token }),
    select: (res) => res.data as { id: string; code: string; discount: { name: Record<string, string> }; usageCount: number; maxUses: number; isActive: boolean }[],
  });

  const tabs = [
    {
      id: "discounts",
      label: `Discounts (${discounts?.length || 0})`,
      content: dl ? <Skeleton className="h-32 w-full" /> : discounts && discounts.length > 0 ? (
        <Table>
          <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Type</TableHead><TableHead className="text-right">Value</TableHead></TableRow></TableHeader>
          <TableBody>{discounts.map((d) => (
            <TableRow key={d.id}><TableCell className="font-medium">{d.name?.en || d.name?.vi}</TableCell><TableCell>{d.type}</TableCell><TableCell className="text-right">{d.type === "percentage" ? `${d.value}%` : new Intl.NumberFormat("vi-VN").format(d.value)}</TableCell></TableRow>
          ))}</TableBody>
        </Table>
      ) : <p className="text-sm text-muted-foreground text-center py-8">No discounts configured.</p>,
    },
    {
      id: "coupons",
      label: `Coupons (${coupons?.length || 0})`,
      content: cl ? <Skeleton className="h-32 w-full" /> : coupons && coupons.length > 0 ? (
        <Table>
          <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Discount</TableHead><TableHead>Usage</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
          <TableBody>{coupons.map((c) => (
            <TableRow key={c.id}><TableCell className="font-mono font-medium">{c.code}</TableCell><TableCell>{c.discount?.name?.en || c.discount?.name?.vi}</TableCell><TableCell>{c.usageCount}/{c.maxUses}</TableCell><TableCell>{c.isActive ? <Badge variant="success">Active</Badge> : <Badge variant="secondary">Inactive</Badge>}</TableCell></TableRow>
          ))}</TableBody>
        </Table>
      ) : <p className="text-sm text-muted-foreground text-center py-8">No coupons created.</p>,
    },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold tracking-tight">Promotions</h1><p className="text-muted-foreground text-sm">Discount rules and coupon codes</p></div>
      <Card><CardContent className="pt-6"><Tabs tabs={tabs} defaultTab="discounts" /></CardContent></Card>
    </div>
  );
}
