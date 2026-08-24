"use client"

import { useCallback, useState, useRef } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { getToken } from "@/lib/api"
import { uploadImage, type UploadedImage } from "@/lib/image-upload"
import { cn } from "@/lib/utils"
import { Upload, X, Loader2, ImageIcon } from "lucide-react"
import { toast } from "sonner"

type ImageUploaderProps = {
  onUploadComplete?: (image: UploadedImage) => void
  entityType?: string
  entityId?: string
  className?: string
  multiple?: boolean
  queryKey?: string[]
}

export function ImageUploader({
  onUploadComplete,
  entityType,
  entityId,
  className,
  multiple = false,
  queryKey,
}: ImageUploaderProps) {
  const token = getToken()
  const queryClient = useQueryClient()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [previews, setPreviews] = useState<string[]>([])

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      return uploadImage(file, token, { entityType, entityId })
    },
    onSuccess: (res, file) => {
      setPreviews((p) => p.filter((u) => u !== URL.createObjectURL(file)))
      toast.success(`Đã tải lên ${file.name}`)
      onUploadComplete?.(res)
      if (queryKey) queryClient.invalidateQueries({ queryKey })
    },
    onError: (err: Error, file) => {
      setPreviews((p) => p.filter((u) => u !== URL.createObjectURL(file)))
      toast.error(`Không thể tải lên ${file.name}: ${err.message}`)
    },
  })

  const handleFiles = useCallback(
    (files: FileList) => {
      const imageFiles = Array.from(files).filter((f) =>
        f.type.startsWith("image/"),
      )
      if (imageFiles.length === 0) {
        toast.error("Chỉ hỗ trợ tệp hình ảnh")
        return
      }
      for (const file of imageFiles) {
        setPreviews((p) => [...p, URL.createObjectURL(file)])
        uploadMutation.mutate(file)
      }
    },
    [uploadMutation],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files)
      }
    },
    [handleFiles],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  return (
    <div className={cn("space-y-3", className)}>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors",
          isDragOver
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/50",
        )}
      >
        {uploadMutation.isPending ? (
          <Loader2 className="mb-2 h-8 w-8 animate-spin text-muted-foreground" />
        ) : (
          <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
        )}
        <p className="text-sm font-medium">
          {uploadMutation.isPending
            ? "Đang tải ảnh..."
            : "Kéo thả ảnh vào đây hoặc bấm để chọn"}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          PNG, JPG, WebP, GIF, AVIF tối đa 10MB
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
          multiple={multiple}
          className="hidden"
          onChange={(e) =>
            e.target.files && handleFiles(e.target.files)
          }
        />
      </div>

      {previews.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {previews.map((preview) => (
            <div key={preview} className="group relative h-16 w-16 overflow-hidden rounded-md border">
              <img
                src={preview}
                alt="Xem trước"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
