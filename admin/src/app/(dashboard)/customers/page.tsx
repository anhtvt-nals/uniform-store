"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { apiClient, getToken } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SearchInput } from "@/components/shared/search-input"
import { Pagination } from "@/components/shared/pagination"
import { EmptyState } from "@/components/shared/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { Eye, Mail, Phone } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { useT } from "@/i18n"

type Customer = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  emailVerified?: boolean;
  createdAt: string;
};

export default function CustomersPage() {
  const { t } = useT();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const token = getToken();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["customers", search, page],
    queryFn: () =>
      apiClient<{ items: Customer[]; total: number; page: number; pageSize: number; totalPages: number }>(
        "/customers", { params: { q: search, page, limit: 20 }, token }
      ),
    select: (res) => res.data,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
        <p className="text-muted-foreground text-sm">Manage your customers</p>
      </div>

      <div className="flex-1 max-w-sm">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} />
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
      ) : isError ? (
        <div className="rounded-md bg-destructive/10 p-4 text-destructive text-sm">Failed to load customers: {(error as Error).message}</div>
      ) : data && data.items.length > 0 ? (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-16">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.firstName} {c.lastName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        {c.email}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {c.phone ? <div className="flex items-center gap-1"><Phone className="h-3 w-3" />{c.phone}</div> : "—"}
                    </TableCell>
                    <TableCell>
                      <span className={c.emailVerified ? "text-emerald-600" : "text-muted-foreground"}>
                        {c.emailVerified ? "Yes" : "No"}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {format(new Date(c.createdAt), "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/customers/${c.id}`}><Eye className="h-4 w-4" /></Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Pagination page={data.page} totalPages={data.totalPages} totalItems={data.total} onPageChange={setPage} />
        </>
      ) : (
        <EmptyState title={t("customers.noCustomers")} description={search ? "Try a different search." : "Customers will appear here after they register."} />
      )}
    </div>
  );
}
