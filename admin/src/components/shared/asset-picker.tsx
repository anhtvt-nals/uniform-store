"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { apiClient, getToken } from "@/lib/api"
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { SearchInput } from "@/components/shared/search-input"
import { Pagination } from "@/components/shared/pagination"
import { Button } from "@/components/ui/button"
import { Loader2, ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type Asset = {
  id: string
  url: string
  alt?: Record<string, string>
  product?: { id: string; slug: string } | null
}

type AssetPickerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (url: string) => void
}

export function AssetPicker({ open, onOpenChange, onSelect }: AssetPickerProps) {
  const token = getToken()
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ["assets", "picker", search, page],
    queryFn: () =>
      apiClient<{ items: Asset[]; total: number; page: number; limit: number }>(
        "/uploads",
        { token, params: { search: search || undefined, page, limit: 48 } },
      ),
    select: (res) => res.data,
    enabled: open,
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>Select Asset</DialogTitle>
        <DialogDescription>Choose an image from uploaded assets</DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <SearchInput
          placeholder="Search assets..."
          value={search}
          onChange={(v) => { setSearch(v); setPage(1) }}
        />
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : data?.items.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-muted-foreground">
            <ImageIcon className="h-8 w-8 mb-2" />
            <p className="text-sm">No assets found</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2 max-h-80 overflow-y-auto p-1">
            {data?.items.map((asset) => (
              <button
                key={asset.id}
                onClick={() => {
                  onSelect(asset.url)
                  onOpenChange(false)
                }}
                className="group relative aspect-square rounded-md border overflow-hidden hover:ring-2 hover:ring-primary transition-all"
              >
                <img
                  src={asset.url}
                  alt=""
                  className="h-full w-full object-cover"
                />
                {asset.product && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1">
                    <p className="text-[10px] text-white truncate">
                      {asset.product.slug}
                    </p>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
        {data && data.total > data.limit && (
          <Pagination
            page={data.page}
            totalPages={Math.ceil(data.total / data.limit)}
            totalItems={data.total}
            onPageChange={setPage}
          />
        )}
      </div>
    </Dialog>
  )
}
