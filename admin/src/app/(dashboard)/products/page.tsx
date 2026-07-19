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
import { Select as SelectNative } from "@/components/ui/select"
import { Plus, Pencil, Trash2, RotateCcw, FolderTree, X } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

type Product = {
  id: string;
  name: Record<string, string>;
  slug: string;
  basePrice: number;
  isActive: boolean;
  isFeatured: boolean;
  category?: { id: string; name: Record<string, string> } | null;
  brand?: { id: string; name: Record<string, string> } | null;
  deletedAt?: string | null;
  createdAt: string;
};

type Category = {
  id: string;
  name: Record<string, string>;
  slug: string;
  parentId?: string | null;
  children?: Category[];
};

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isActive, setIsActive] = useState<string>("");
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [restoreId, setRestoreId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const token = getToken();

  const params: Record<string, string | number | boolean | undefined> = { search, page, limit: 20 };
  if (isActive) params.isActive = isActive === "true" ? "true" : "false";
  if (includeDeleted) params.includeDeleted = "true";
  if (selectedCategoryId) params.categoryId = selectedCategoryId;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["products", search, page, isActive, includeDeleted, selectedCategoryId],
    queryFn: () =>
      apiClient<{ items: Product[]; total: number; page: number; totalPages: number }>("/products", { params, token }),
    select: (res) => res.data,
  });

  const { data: flatCategories } = useQuery({
    queryKey: ["categories", "all"],
    queryFn: () => apiClient<{ items: Category[] }>("/categories", { params: { limit: 200 }, token }),
    select: (res) => res.data?.items || [],
  });

  function buildTree(items: Category[]): Category[] {
    const map = new Map<string, Category & { children: Category[] }>();
    const roots: (Category & { children: Category[] })[] = [];
    for (const cat of items) {
      map.set(cat.id, { ...cat, children: [] });
    }
    for (const cat of items) {
      const node = map.get(cat.id)!;
      if (cat.parentId && map.has(cat.parentId)) {
        map.get(cat.parentId)!.children.push(node);
      } else if (!cat.parentId) {
        roots.push(node);
      }
    }
    return roots;
  }

  const categories = flatCategories ? buildTree(flatCategories) : [];

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient(`/products/${id}`, { method: "DELETE", token }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["products"] }); toast.success("Product deleted"); setDeleteId(null); },
    onError: (err: Error) => toast.error(err.message),
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => apiClient(`/products/${id}/restore`, { method: "PATCH", token }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["products"] }); toast.success("Product restored"); setRestoreId(null); },
    onError: (err: Error) => toast.error(err.message),
  });

  function renderCategoryTree(items: Category[], depth = 0) {
    return items.map((cat) => (
      <div key={cat.id}>
        <button
          type="button"
          onClick={() => {
            setSelectedCategoryId(selectedCategoryId === cat.id ? null : cat.id);
            setPage(1);
          }}
          className={cn(
            "w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors hover:bg-muted",
            selectedCategoryId === cat.id ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground",
          )}
          style={{ paddingLeft: `${12 + depth * 16}px` }}
        >
          {cat.name?.en || cat.name?.vi || cat.slug}
        </button>
        {cat.children && cat.children.length > 0 && renderCategoryTree(cat.children, depth + 1)}
      </div>
    ));
  }

  return (
    <div className="flex gap-6">
      <aside className="w-64 shrink-0 hidden lg:block">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <FolderTree className="h-4 w-4" />
            Categories
          </div>
          {selectedCategoryId && (
            <button
              type="button"
              onClick={() => { setSelectedCategoryId(null); setPage(1); }}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <X className="h-3 w-3" /> Clear
            </button>
          )}
        </div>
        <div className="space-y-0.5 max-h-[calc(100vh-12rem)] overflow-y-auto">
          {categories && categories.length > 0 ? renderCategoryTree(categories) : (
            <p className="text-xs text-muted-foreground px-3">No categories</p>
          )}
        </div>
      </aside>

      <div className="flex-1 min-w-0 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Products</h1>
            <p className="text-muted-foreground text-sm">Manage your product catalog</p>
          </div>
          <Button asChild>
            <Link href="/products/new"><Plus className="h-4 w-4" /> New Product</Link>
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 max-w-sm">
            <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} />
          </div>
          <SelectNative
            options={[
              { value: "", label: "All Status" },
              { value: "true", label: "Active Only" },
              { value: "false", label: "Inactive Only" },
            ]}
            value={isActive}
            onChange={(e) => { setIsActive(e.target.value); setPage(1); }}
          />
          <label className="flex items-center gap-2 text-sm cursor-pointer whitespace-nowrap">
            <input type="checkbox" checked={includeDeleted} onChange={(e) => { setIncludeDeleted(e.target.checked); setPage(1); }} className="rounded border-gray-300" />
            Show deleted
          </label>
        </div>

        {isLoading ? (
          <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : isError ? (
          <div className="rounded-md bg-destructive/10 p-4 text-destructive text-sm">Failed to load products: {(error as Error).message}</div>
        ) : data && data.items.length > 0 ? (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead className="text-right">Base Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((p) => (
                    <TableRow key={p.id} className={p.deletedAt ? "opacity-50" : ""}>
                      <TableCell className="font-medium">{p.name?.en || p.name?.vi || p.slug}</TableCell>
                      <TableCell className="text-muted-foreground">{p.category?.name?.en || p.category?.name?.vi || "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{p.brand?.name?.en || p.brand?.name?.vi || "—"}</TableCell>
                      <TableCell className="text-right">
                        {p.basePrice != null
                          ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(p.basePrice)
                          : "—"}
                      </TableCell>
                      <TableCell>
                        {p.deletedAt ? <Badge variant="destructive">Deleted</Badge>
                          : p.isActive ? <Badge variant="success">Active</Badge>
                          : <Badge variant="secondary">Inactive</Badge>}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">{format(new Date(p.createdAt), "dd/MM/yyyy")}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/products/${p.id}`}><Pencil className="h-4 w-4" /></Link>
                          </Button>
                          {p.deletedAt ? (
                            <Button variant="ghost" size="icon" onClick={() => setRestoreId(p.id)}><RotateCcw className="h-4 w-4" /></Button>
                          ) : (
                            <Button variant="ghost" size="icon" onClick={() => setDeleteId(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
            title="No products found"
            description={search ? "Try a different search term." : "Add your first product to the catalog."}
            action={<Button asChild><Link href="/products/new"><Plus className="h-4 w-4" /> New Product</Link></Button>}
          />
        )}

        <ConfirmDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)} onConfirm={() => deleteId && deleteMutation.mutate(deleteId)} title="Delete Product" description="This product will be soft-deleted." isLoading={deleteMutation.isPending} />
        <ConfirmDialog open={!!restoreId} onOpenChange={() => setRestoreId(null)} onConfirm={() => restoreId && restoreMutation.mutate(restoreId)} title="Restore Product" description="This will restore the soft-deleted product." confirmText="Restore" isLoading={restoreMutation.isPending} />
      </div>
    </div>
  );
}
