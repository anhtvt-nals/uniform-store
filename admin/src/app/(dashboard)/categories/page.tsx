"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient, getToken } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SearchInput } from "@/components/shared/search-input"
import { Pagination } from "@/components/shared/pagination"
import { EmptyState } from "@/components/shared/empty-state"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Pencil, Trash2, RotateCcw } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { useT } from "@/i18n"
import { format } from "date-fns"

type Category = {
  id: string;
  name: Record<string, string>;
  slug: string;
  isActive: boolean;
  sortOrder: number;
  parentId: string | null;
  parent?: { id: string; name: Record<string, string> } | null;
  deletedAt?: string | null;
  createdAt: string;
};

type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export default function CategoriesPage() {
  const { t } = useT();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [restoreId, setRestoreId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const token = getToken();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["categories", search, page, includeDeleted],
    queryFn: () =>
      apiClient<PaginatedResponse<Category>>("/categories", {
        params: { search, page, limit: 20, includeDeleted: includeDeleted ? "true" : undefined },
        token,
      }),
    select: (res) => res.data,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient(`/categories/${id}`, { method: "DELETE", token }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category deleted successfully");
      setDeleteId(null);
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient(`/categories/${id}/restore`, { method: "PATCH", token }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category restored successfully");
      setRestoreId(null);
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground text-sm">Manage product categories</p>
        </div>
        <Button asChild>
          <Link href="/categories/new">
            <Plus className="h-4 w-4" />
            {t("categories.newCategory")}
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 max-w-sm">
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} />
        </div>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={includeDeleted}
            onChange={(e) => { setIncludeDeleted(e.target.checked); setPage(1); }}
            className="rounded border-gray-300"
          />
          Show deleted
        </label>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-md bg-destructive/10 p-4 text-destructive text-sm">
          Failed to load categories: {(error as Error).message}
        </div>
      ) : data && data.items.length > 0 ? (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Parent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sort Order</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((cat) => (
                  <TableRow key={cat.id} className={cat.deletedAt ? "opacity-50" : ""}>
                    <TableCell className="font-medium">
                      {cat.name?.en || cat.name?.vi || cat.slug}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{cat.slug}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {cat.parent ? (cat.parent.name?.en || cat.parent.name?.vi) : "—"}
                    </TableCell>
                    <TableCell>
                      {cat.deletedAt ? (
                        <Badge variant="destructive">Deleted</Badge>
                      ) : cat.isActive ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell>{cat.sortOrder}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {format(new Date(cat.createdAt), "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/categories/${cat.id}`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        {cat.deletedAt ? (
                          <Button variant="ghost" size="icon" onClick={() => setRestoreId(cat.id)}>
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button variant="ghost" size="icon" onClick={() => setDeleteId(cat.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            totalItems={data.total}
            onPageChange={setPage}
          />
        </>
      ) : (
        <EmptyState
          title={t("categories.noCategories")}
          description={search ? "Try a different search term." : "Create your first category to organize products."}
          action={
            <Button asChild>
              <Link href="/categories/new">
                <Plus className="h-4 w-4" />
                {t("categories.newCategory")}
              </Link>
            </Button>
          }
        />
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Delete Category"
        description="This category will be soft-deleted. You can restore it later."
        isLoading={deleteMutation.isPending}
      />

      <ConfirmDialog
        open={!!restoreId}
        onOpenChange={() => setRestoreId(null)}
        onConfirm={() => restoreId && restoreMutation.mutate(restoreId)}
        title="Restore Category"
        description="This will restore the soft-deleted category."
        confirmText="Restore"
        isLoading={restoreMutation.isPending}
      />
    </div>
  );
}
