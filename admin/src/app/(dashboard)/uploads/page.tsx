"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient, getToken } from "@/lib/api"
import { ImageUploader } from "@/components/shared/image-uploader"
import { SearchInput } from "@/components/shared/search-input"
import { Pagination } from "@/components/shared/pagination"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Trash2, ExternalLink, ImageIcon } from "lucide-react"
import { toast } from "sonner"
import { useT } from "@/i18n"
import { cn } from "@/lib/utils"

type Asset = {
  id: string
  url: string
  key: string
  alt?: Record<string, string>
  filename: string
  mimeType: string
  size: number
  createdAt: string
}

type ListResponse = {
  items: Asset[]
  total: number
  page: number
  limit: number
}

export default function UploadsPage() {
  const { t } = useT();
  const token = getToken()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ["assets", search, page],
    queryFn: () =>
      apiClient<ListResponse>("/uploads", {
        token,
        params: { search: search || undefined, page, limit: 48 },
      }),
    select: (res) => res.data,
  })

  const deleteMutation = useMutation({
    mutationFn: (asset: Asset) =>
      apiClient("/uploads", {
        method: "DELETE",
        body: { key: asset.key },
        token,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] })
      toast.success("Asset deleted")
      setDeleteId(null)
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const handleUploadComplete = () => {
    queryClient.invalidateQueries({ queryKey: ["assets"] })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Assets</h1>
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
            placeholder="Search assets..."
            value={search}
            onChange={(v) => {
              setSearch(v)
              setPage(1)
            }}
          />
        </div>
        {data && (
          <p className="text-sm text-muted-foreground">
            {data.total} asset(s)
          </p>
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
          <p className="text-sm">No assets found</p>
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
          const asset = data?.items.find((a) => a.id === deleteId)
          if (asset) deleteMutation.mutate(asset)
        }}
        title="Delete Asset"
        description="This image will be permanently deleted."
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
