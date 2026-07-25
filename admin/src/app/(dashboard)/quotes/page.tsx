"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient, getToken } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"

import { toast } from "sonner"
import { Search, Eye } from "lucide-react"
import { useT } from "@/i18n"

type QuoteRequest = {
  id: string
  customerName: string
  phone: string
  email: string
  region: string
  address: string
  productType: string
  quantity: number
  status: string
  salesNote: string
  source: string
  createdAt: string
  updatedAt: string
}

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  NEW: { label: "New", className: "bg-blue-100 text-blue-800" },
  CONTACTED: { label: "Contacted", className: "bg-yellow-100 text-yellow-800" },
  COMPLETED: { label: "Completed", className: "bg-green-100 text-green-800" },
  CANCELLED: { label: "Cancelled", className: "bg-gray-100 text-gray-800" },
}

export default function QuotesPage() {
  const { t } = useT();
  const token = getToken()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<QuoteRequest | null>(null)
  const [noteText, setNoteText] = useState("")

  const { data, isLoading } = useQuery({
    queryKey: ["quote-requests", search, status, page],
    queryFn: () =>
      apiClient<{ items: QuoteRequest[]; total: number; totalPages: number }>(
        "/quote-requests",
        {
          params: { search: search || undefined, status: status || undefined, page, limit: 20 },
          token,
        }
      ),
    select: (res) => res.data,
  })

  const statusMutation = useMutation({
    mutationFn: (vars: { id: string; status: string }) =>
      apiClient(`/quote-requests/${vars.id}/status`, {
        method: "PATCH",
        body: { status: vars.status },
        token,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quote-requests"] })
      toast.success("Status updated")
      setSelected(null)
    },
  })

  const notesMutation = useMutation({
    mutationFn: (vars: { id: string; salesNote: string }) =>
      apiClient(`/quote-requests/${vars.id}/notes`, {
        method: "POST",
        body: { salesNote: vars.salesNote },
        token,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quote-requests"] })
      toast.success("Note saved")
      setNoteText("")
    },
  })

  const openDetail = (q: QuoteRequest) => {
    setSelected(q)
    setNoteText(q.salesNote || "")
  }

  const regionLabel = (region: string) => {
    const map: Record<string, string> = { north: "Miền Bắc", central: "Miền Trung", south: "Miền Nam" }
    return map[region] || region
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("nav.quotes") || "Quotes"}</h1>
        <p className="text-muted-foreground text-sm">Customer quotation requests</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search name, phone, email..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                className="pl-9"
              />
            </div>
            <Select
              className="w-[150px]"
              placeholder="All statuses"
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1) }}
              options={[
                { value: "", label: "All statuses" },
                { value: "NEW", label: "New" },
                { value: "CONTACTED", label: "Contacted" },
                { value: "COMPLETED", label: "Completed" },
                { value: "CANCELLED", label: "Cancelled" },
              ]}
            />
          </div>

          {isLoading ? (
            <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.items?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        No quote requests yet.
                      </TableCell>
                    </TableRow>
                  )}
                  {data?.items?.map((q) => (
                    <TableRow key={q.id}>
                      <TableCell className="font-medium">{q.customerName}</TableCell>
                      <TableCell className="text-muted-foreground">{q.phone}</TableCell>
                      <TableCell className="max-w-[150px] truncate">{q.productType || "-"}</TableCell>
                      <TableCell>{q.quantity}</TableCell>
                      <TableCell>
                        <Badge className={STATUS_MAP[q.status]?.className || ""}>
                          {STATUS_MAP[q.status]?.label || q.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(q.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDetail(q)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Page {page} of {data.totalPages} ({data.total} total)
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
                <Button variant="outline" size="sm" disabled={page >= data.totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        {selected && (
          <>
            <DialogHeader>
              <DialogTitle>{selected.customerName}</DialogTitle>
              <DialogDescription>Quote request detail</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-muted-foreground text-xs">Phone</p>
                  <p className="font-medium">{selected.phone}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Email</p>
                  <p className="font-medium">{selected.email || "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Region</p>
                  <p className="font-medium">{regionLabel(selected.region) || "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Quantity</p>
                  <p className="font-medium">{selected.quantity}</p>
                </div>
              </div>
              {selected.address && (
                <div>
                  <p className="text-muted-foreground text-xs">Address</p>
                  <p className="font-medium">{selected.address}</p>
                </div>
              )}
              {selected.productType && (
                <div>
                  <p className="text-muted-foreground text-xs">Product Type</p>
                  <p className="font-medium">{selected.productType}</p>
                </div>
              )}
              <div>
                <p className="text-muted-foreground text-xs">Status</p>
                <Select
                  className="h-8 mt-1"
                  value={selected.status}
                  onChange={(e) => statusMutation.mutate({ id: selected.id, status: e.target.value })}
                  options={[
                    { value: "NEW", label: "New" },
                    { value: "CONTACTED", label: "Contacted" },
                    { value: "COMPLETED", label: "Completed" },
                    { value: "CANCELLED", label: "Cancelled" },
                  ]}
                />
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-1">Sales Note</p>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Add internal notes..."
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                <Button
                  size="sm"
                  className="mt-2"
                  onClick={() => notesMutation.mutate({ id: selected.id, salesNote: noteText })}
                  disabled={notesMutation.isPending}
                >
                  Save Note
                </Button>
              </div>
              <p className="text-muted-foreground text-xs">
                Submitted: {new Date(selected.createdAt).toLocaleString()}
              </p>
            </div>
          </>
        )}
      </Dialog>
    </div>
  )
}
