"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient, getToken } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { Search, Eye, Trash2, Mail, Phone, Building2 } from "lucide-react"

type Inquiry = {
  id: string
  productId: string
  fullName: string
  email: string
  phone: string
  company: string
  quantity: number
  notes: string
  status: string
  createdAt: string
  product?: { id: string; name: Record<string, string>; slug: string }
}

const STATUS_LABELS: Record<string, { label: string; variant: string }> = {
  pending: { label: "Pending", variant: "bg-yellow-100 text-yellow-800" },
  contacted: { label: "Contacted", variant: "bg-blue-100 text-blue-800" },
  completed: { label: "Completed", variant: "bg-green-100 text-green-800" },
  cancelled: { label: "Cancelled", variant: "bg-gray-100 text-gray-800" },
}

export default function InquiriesPage() {
  const token = getToken()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<string>("")
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Inquiry | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ["inquiries", search, status, page],
    queryFn: () =>
      apiClient<{ items: Inquiry[]; total: number; totalPages: number }>(
        "/inquiries",
        {
          params: { search: search || undefined, status: status || undefined, page, limit: 20 },
          token,
        }
      ),
    select: (res) => res.data,
  })

  const statusMutation = useMutation({
    mutationFn: (vars: { id: string; status: string }) =>
      apiClient(`/inquiries/${vars.id}/status`, {
        method: "PATCH",
        body: { status: vars.status },
        token,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inquiries"] })
      toast.success("Status updated")
      setSelected(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient(`/inquiries/${id}`, { method: "DELETE", token }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inquiries"] })
      toast.success("Inquiry deleted")
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Inquiries</h1>
        <p className="text-muted-foreground text-sm">Manage customer product inquiries</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, company..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                className="pl-9"
              />
            </div>
            <Select value={status || "all"} onValueChange={(v) => { setStatus(v === "all" ? "" : v); setPage(1) }}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.items?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        No inquiries found
                      </TableCell>
                    </TableRow>
                  )}
                  {data?.items?.map((inquiry) => (
                    <TableRow key={inquiry.id}>
                      <TableCell className="font-medium">{inquiry.fullName}</TableCell>
                      <TableCell className="text-muted-foreground">{inquiry.email}</TableCell>
                      <TableCell>{inquiry.product?.name?.vi || inquiry.product?.name?.en || "-"}</TableCell>
                      <TableCell>{inquiry.quantity}</TableCell>
                      <TableCell>
                        <Badge className={STATUS_LABELS[inquiry.status]?.variant || ""}>
                          {STATUS_LABELS[inquiry.status]?.label || inquiry.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(inquiry.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelected(inquiry)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMutation.mutate(inquiry.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Inquiry from {selected?.fullName}</DialogTitle>
            <DialogDescription>{selected?.email}</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /><span>{selected.email}</span></div>
                {selected.phone && <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /><span>{selected.phone}</span></div>}
                {selected.company && <div className="flex items-center gap-2"><Building2 className="h-4 w-4 text-muted-foreground" /><span>{selected.company}</span></div>}
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Product</p>
                <p className="font-medium">{selected.product?.name?.vi || selected.product?.name?.en || "-"}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-muted-foreground">Quantity</p><p className="font-medium">{selected.quantity}</p></div>
                <div><p className="text-muted-foreground">Status</p>
                  <Select value={selected.status} onValueChange={(v) => statusMutation.mutate({ id: selected.id, status: v })}>
                    <SelectTrigger className="h-8 mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {selected.notes && (
                <div><p className="text-muted-foreground mb-1">Notes</p><p className="bg-muted rounded p-3">{selected.notes}</p></div>
              )}
              <p className="text-muted-foreground text-xs">Submitted: {new Date(selected.createdAt).toLocaleString()}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
