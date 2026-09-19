"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, getToken } from "@/lib/api";
import { ImageUploader } from "@/components/shared/image-uploader";
import { SearchInput } from "@/components/shared/search-input";
import { Pagination } from "@/components/shared/pagination";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Dialog, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, ExternalLink, ImageIcon, Pencil } from "lucide-react";
import { toast } from "sonner";
import { useT } from "@/i18n";
import { cn } from "@/lib/utils";

type Asset = {
  id: string;
  url: string;
  key: string;
  alt?: Record<string, string>;
  caption?: Record<string, string>;
  title?: Record<string, string>;
  linkUrl?: string;
  filename: string;
  mimeType: string;
  size: number;
  createdAt: string;
};

type ListResponse = {
  items: Asset[];
  total: number;
  page: number;
  limit: number;
};

export default function UploadsPage() {
  const { t } = useT();
  const token = getToken();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["assets", search, page],
    queryFn: () =>
      apiClient<ListResponse>("/uploads", {
        token,
        params: { search: search || undefined, page, limit: 48 },
      }),
    select: (res) => res.data,
  });

  const deleteMutation = useMutation({
    mutationFn: (asset: Asset) =>
      apiClient("/uploads", {
        method: "DELETE",
        body: { key: asset.key },
        token,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      toast.success("Đã xóa tài nguyên");
      setDeleteId(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: (asset: Asset) =>
      apiClient(`/uploads/${asset.id}`, {
        method: "PATCH",
        body: {
          alt: asset.alt ?? {},
          caption: asset.caption ?? {},
          title: asset.title ?? {},
          linkUrl: asset.linkUrl ?? "",
        },
        token,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      toast.success("Đã lưu metadata tài nguyên");
      setEditingAsset(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleUploadComplete = () => {
    queryClient.invalidateQueries({ queryKey: ["assets"] });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tài nguyên</h1>
          <p className="text-muted-foreground text-sm">
            Manage all uploaded images
          </p>
        </div>
      </div>

      <ImageUploader
        onUploadComplete={handleUploadComplete}
        multiple
        queryKey={["assets"]}
      />

      <div className="flex items-center gap-4">
        <div className="max-w-sm">
          <SearchInput
            placeholder="Tìm kiếm tài nguyên..."
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
          />
        </div>
        {data && (
          <p className="text-sm text-muted-foreground">{data.total} asset(s)</p>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
          {Array.from({ length: 24 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-md" />
          ))}
        </div>
      ) : data?.items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <ImageIcon className="h-12 w-12 mb-3" />
          <p className="text-sm">Không tìm thấy tài nguyên</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
            {data?.items.map((asset) => (
              <div
                key={asset.id}
                className="group relative rounded-md border overflow-hidden bg-muted/20"
              >
                <img
                  src={asset.url}
                  alt={asset.alt?.en || ""}
                  className="aspect-square object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
                <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a
                    href={asset.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-background/80 p-1.5 hover:bg-background"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <button
                    onClick={() => setEditingAsset(asset)}
                    className="rounded-full bg-background/80 p-1.5 hover:bg-background"
                    aria-label="Chỉnh sửa metadata tài nguyên"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => setDeleteId(asset.id)}
                    className="rounded-full bg-background/80 p-1.5 hover:bg-background"
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {data && data.total > data.limit && (
            <Pagination
              page={data.page}
              totalPages={Math.ceil(data.total / data.limit)}
              totalItems={data.total}
              onPageChange={setPage}
            />
          )}
        </>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        onConfirm={() => {
          const asset = data?.items.find((a) => a.id === deleteId);
          if (asset) deleteMutation.mutate(asset);
        }}
        title="Xóa tài nguyên"
        description="This image will be permanently deleted."
        isLoading={deleteMutation.isPending}
      />

      <Dialog open={!!editingAsset} onOpenChange={() => setEditingAsset(null)}>
        <DialogHeader>
          <DialogTitle>Metadata tài nguyên</DialogTitle>
          <DialogDescription>{editingAsset?.filename}</DialogDescription>
        </DialogHeader>
        {editingAsset && (
          <div className="space-y-3">
            <div className="space-y-1"><Label>Alt (tiếng Việt)</Label><Input value={editingAsset.alt?.vi ?? ""} onChange={(event) => setEditingAsset({ ...editingAsset, alt: { ...editingAsset.alt, vi: event.target.value } })} /></div>
            <div className="space-y-1"><Label>Chú thích (tiếng Việt)</Label><Input value={editingAsset.caption?.vi ?? ""} onChange={(event) => setEditingAsset({ ...editingAsset, caption: { ...editingAsset.caption, vi: event.target.value } })} /></div>
            <div className="space-y-1"><Label>Tiêu đề (tiếng Việt)</Label><Input value={editingAsset.title?.vi ?? ""} onChange={(event) => setEditingAsset({ ...editingAsset, title: { ...editingAsset.title, vi: event.target.value } })} /></div>
            <div className="space-y-1"><Label>URL liên kết</Label><Input value={editingAsset.linkUrl ?? ""} onChange={(event) => setEditingAsset({ ...editingAsset, linkUrl: event.target.value })} /></div>
          </div>
        )}
        <DialogFooter><Button type="button" variant="outline" onClick={() => setEditingAsset(null)}>Hủy</Button><Button type="button" disabled={updateMutation.isPending || !editingAsset} onClick={() => editingAsset && updateMutation.mutate(editingAsset)}>Lưu</Button></DialogFooter>
      </Dialog>
    </div>
  );
}
