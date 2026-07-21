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
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Pencil, Trash2, RotateCcw, ExternalLink } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { useT } from "@/i18n"
import { format } from "date-fns"

type Brand = {
  id: string;
  name: Record<string, string>;
  slug: string;
  logoUrl?: string;
  websiteUrl?: string;
  isActive: boolean;
  sortOrder: number;
  deletedAt?: string | null;
  createdAt: string;
};

export default function BrandsPage() {
  const { t } = useT();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [restoreId, setRestoreId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const token = getToken();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["brands", search, page, includeDeleted],
    queryFn: () =>
      apiClient<{ items: Brand[]; total: number; page: number; pageSize: number; totalPages: number }>("/brands", {
        params: { search, page, limit: 20, includeDeleted: includeDeleted ? "true" : undefined },
        token,
      }),
    select: (res) => res.data,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient(`/brands/${id}`, { method: "DELETE", token }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      toast.success("Brand deleted successfully");
      setDeleteId(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => apiClient(`/brands/${id}/restore`, { method: "PATCH", token }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      toast.success("Brand restored successfully");
      setRestoreId(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Brands</h1>
          <p className="text-muted-foreground text-sm">Manage product brands</p>
        </div>
        <Button asChild>
          <Link href="/brands/new">
            <Plus className="h-4 w-4" />
            {t("brands.newBrand")}
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 max-w-sm">
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} />
        </div>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={includeDeleted} onChange={(e) => { setIncludeDeleted(e.target.checked); setPage(1); }} className="rounded border-gray-300" />
          Show deleted
        </label>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
      ) : isError ? (
        <div className="rounded-md bg-destructive/10 p-4 text-destructive text-sm">
          Failed to load brands: {(error as Error).message}
        </div>
      ) : data && data.items.length > 0 ? (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Logo</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sort Order</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((brand) => (
                  <TableRow key={brand.id} className={brand.deletedAt ? "opacity-50" : ""}>
                    <TableCell>
                      {brand.logoUrl ? (
                        <img src={brand.logoUrl} alt="" className="h-8 w-8 rounded object-contain" />
                      ) : (
                        <div className="h-8 w-8 rounded bg-muted" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{brand.name?.en || brand.name?.vi || brand.slug}</TableCell>
                    <TableCell className="text-muted-foreground">{brand.slug}</TableCell>
                    <TableCell>
                      {brand.deletedAt ? (
                        <Badge variant="destructive">Deleted</Badge>
                      ) : brand.isActive ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell>{brand.sortOrder}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {format(new Date(brand.createdAt), "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/brands/${brand.id}`}><Pencil className="h-4 w-4" /></Link>
                        </Button>
                        {brand.deletedAt ? (
                          <Button variant="ghost" size="icon" onClick={() => setRestoreId(brand.id)}>
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button variant="ghost" size="icon" onClick={() => setDeleteId(brand.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                        {brand.websiteUrl && (
                          <Button variant="ghost" size="icon" asChild>
                            <a href={brand.websiteUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Pagination page={data.page} totalPages={data.totalPages} totalItems={data.total} onPageChange={setPage} />
        </>
      ) : (
        <EmptyState
          title={t("brands.noBrands")}
          description={search ? "Try a different search term." : "Create your first brand."}
          action={<Button asChild><Link href="/brands/new"><Plus className="h-4 w-4" /> {t("brands.newBrand")}</Link></Button>}
        />
      )}

      <ConfirmDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)} onConfirm={() => deleteId && deleteMutation.mutate(deleteId)} title="Delete Brand" description="This brand will be soft-deleted. You can restore it later." isLoading={deleteMutation.isPending} />
      <ConfirmDialog open={!!restoreId} onOpenChange={() => setRestoreId(null)} onConfirm={() => restoreId && restoreMutation.mutate(restoreId)} title="Restore Brand" description="This will restore the soft-deleted brand." confirmText="Restore" isLoading={restoreMutation.isPending} />
    </div>
  );
}
