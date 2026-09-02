"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, getToken } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SearchInput } from "@/components/shared/search-input";
import { Pagination } from "@/components/shared/pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Select as SelectNative } from "@/components/ui/select";
import { Plus, Pencil, Trash2, RotateCcw, Search, Copy } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useT } from "@/i18n";
import { formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";

type Product = {
  id: string;
  name: Record<string, string>;
  slug: string;
  basePrice: number;
  images?: { id: string; url: string; sortOrder: number }[];
  isActive: boolean;
  isFeatured: boolean;
  isContactPrice: boolean;
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
};

export default function ProductsPage() {
  const { t } = useT();
  const [search, setSearch] = useState("");
  const [searchDraft, setSearchDraft] = useState("");
  const [page, setPage] = useState(1);
  const [isActive, setIsActive] = useState<string>("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [restoreId, setRestoreId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const queryClient = useQueryClient();
  const router = useRouter();
  const token = getToken();

  const params: Record<string, string | number | boolean | undefined> = {
    search,
    page,
    limit: 20,
  };
  if (isActive) params.isActive = isActive === "true" ? "true" : "false";
  if (selectedCategoryId) params.categoryId = selectedCategoryId;
  const returnTo = `/products?${new URLSearchParams(
    Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== "")
      .map(([key, value]) => [key, String(value)]),
  ).toString()}`;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["products", search, page, isActive, selectedCategoryId],
    queryFn: () =>
      apiClient<{
        items: Product[];
        total: number;
        page: number;
        totalPages: number;
      }>("/products", { params, token }),
    select: (res) => res.data,
    refetchOnMount: "always",
  });

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["products"] });
  }, [queryClient]);

  const { data: flatCategories } = useQuery({
    queryKey: ["categories", "all"],
    queryFn: () =>
      apiClient<{ items: Category[] }>("/categories", {
        params: { limit: 200 },
        token,
      }),
    select: (res) => res.data?.items || [],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient(`/products/${id}`, { method: "DELETE", token }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Đã xóa sản phẩm");
      setDeleteId(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient(`/products/${id}/restore`, { method: "PATCH", token }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Đã khôi phục sản phẩm");
      setRestoreId(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const duplicateMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient<{ id: string }>(`/products/${id}/duplicate`, {
        method: "POST",
        token,
      }),
    onSuccess: (response) => {
      const duplicated = response.data;
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Đã nhân bản sản phẩm");
      if (duplicated?.id) router.push(`/products/${duplicated.id}`);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sản phẩm</h1>
          <p className="text-muted-foreground text-sm">
            Quản lý danh mục sản phẩm
          </p>
        </div>
        <Button asChild>
          <Link href="/products/new">
            <Plus className="h-4 w-4" /> {t("products.newProduct")}
          </Link>
        </Button>
      </div>

      <div className="flex flex-nowrap items-center gap-3 overflow-x-auto pb-1">
        <div className="w-72 shrink-0">
          <SearchInput
            value={searchDraft}
            onChange={setSearchDraft}
            placeholder="Tìm kiếm sản phẩm..."
          />
        </div>
        <SelectNative
          className="w-48 shrink-0"
          options={[
            { value: "", label: "Tất cả danh mục" },
            ...(flatCategories || []).map((category) => ({
              value: category.id,
              label: category.name?.vi || category.name?.en || category.slug,
            })),
          ]}
          value={selectedCategoryId || ""}
          onChange={(e) => {
            setSelectedCategoryId(e.target.value || null);
            setPage(1);
          }}
        />
        <SelectNative
          className="w-44 shrink-0"
          options={[
            { value: "", label: "Tất cả trạng thái" },
            { value: "true", label: "Đang hiển thị" },
            { value: "false", label: "Đang ẩn" },
          ]}
          value={isActive}
          onChange={(e) => {
            setIsActive(e.target.value);
            setPage(1);
          }}
        />
        <Button
          className="shrink-0"
          onClick={() => {
            setSearch(searchDraft);
            setPage(1);
          }}
        >
          <Search className="h-4 w-4" />
          Tìm kiếm
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-md bg-destructive/10 p-4 text-destructive text-sm">
          Không thể tải sản phẩm: {(error as Error).message}
        </div>
      ) : data && data.items.length > 0 ? (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[76px]">Ảnh</TableHead>
                  <TableHead>Tên</TableHead>
                  <TableHead>Danh mục</TableHead>
                  <TableHead>Thương hiệu</TableHead>
                  <TableHead className="text-right">Giá (VNĐ)</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="w-24">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((p) => (
                  <TableRow
                    key={p.id}
                    className={p.deletedAt ? "opacity-50" : ""}
                  >
                    <TableCell>
                      {p.images?.[0]?.url ? (
                        <img
                          src={p.images[0].url}
                          alt=""
                          className="h-[60px] w-[60px] rounded-md object-cover"
                        />
                      ) : (
                        <div className="h-[60px] w-[60px] rounded-md bg-muted" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {p.name?.vi || p.name?.en || p.slug}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {p.category?.name?.vi || p.category?.name?.en || "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {p.brand?.name?.vi || p.brand?.name?.en || "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {p.isContactPrice
                        ? "Giá liên hệ"
                        : p.basePrice != null
                          ? new Intl.NumberFormat("vi-VN", {
                              maximumFractionDigits: 0,
                            }).format(Math.round(p.basePrice)) + " VNĐ"
                          : "—"}
                    </TableCell>
                    <TableCell>
                      {p.deletedAt ? (
                        <Badge variant="destructive">Đã xóa</Badge>
                      ) : p.isActive ? (
                        <Badge variant="success">Hiển thị</Badge>
                      ) : (
                        <Badge variant="secondary">Đang ẩn</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {formatDate(p.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" asChild>
                          <Link
                            href={`/products/${p.id}?returnTo=${encodeURIComponent(returnTo)}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        {!p.deletedAt && (
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Nhân bản sản phẩm"
                            aria-label="Nhân bản sản phẩm"
                            disabled={duplicateMutation.isPending}
                            onClick={() => duplicateMutation.mutate(p.id)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        )}
                        {p.deletedAt ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setRestoreId(p.id)}
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(p.id)}
                          >
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
          title={t("products.noProducts")}
          description={
            search
              ? "Hãy thử từ khóa tìm kiếm khác."
              : "Thêm sản phẩm đầu tiên vào danh mục."
          }
          action={
            <Button asChild>
              <Link href="/products/new">
                <Plus className="h-4 w-4" /> {t("products.newProduct")}
              </Link>
            </Button>
          }
        />
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Xóa sản phẩm"
        description="Sản phẩm sẽ được xóa tạm thời."
        isLoading={deleteMutation.isPending}
      />
      <ConfirmDialog
        open={!!restoreId}
        onOpenChange={() => setRestoreId(null)}
        onConfirm={() => restoreId && restoreMutation.mutate(restoreId)}
        title="Khôi phục sản phẩm"
        description="Sản phẩm đã xóa sẽ được khôi phục."
        confirmText="Khôi phục"
        isLoading={restoreMutation.isPending}
      />
    </div>
  );
}
