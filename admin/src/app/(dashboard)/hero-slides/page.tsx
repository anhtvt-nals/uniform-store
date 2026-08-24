"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, getToken } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImageUploader } from "@/components/shared/image-uploader";
import { AssetPicker } from "@/components/shared/asset-picker";
import { Edit, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Slide = {
  id: string;
  title: Record<string, string>;
  subtitle: Record<string, string>;
  imageUrl: string;
  isActive: boolean;
  sortOrder: number;
};
type Form = {
  title: string;
  content: string;
  imageUrl: string;
  sortOrder: number;
  isActive: boolean;
};
const blank: Form = {
  title: "",
  content: "",
  imageUrl: "",
  sortOrder: 0,
  isActive: true,
};

function SlideEditor({
  initial,
  onSave,
  onCancel,
  submitLabel,
}: {
  initial: Form;
  onSave: (value: Form) => void;
  onCancel: () => void;
  submitLabel: string;
}) {
  const [value, setValue] = useState(initial);
  const [assetPickerOpen, setAssetPickerOpen] = useState(false);
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
        <Input
          value={value.title}
          onChange={(e) => setValue({ ...value, title: e.target.value })}
          placeholder="Tiêu đề"
        />
        <textarea
          value={value.content}
          onChange={(e) => setValue({ ...value, content: e.target.value })}
          placeholder="Nội dung"
          className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm"
        />
        <div className="space-y-2 border-t pt-3">
          <div className="space-y-2">
            <ImageUploader
              onUploadComplete={(image) =>
                setValue({ ...value, imageUrl: image.url })
              }
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAssetPickerOpen(true)}
            >
              Chọn từ assets
            </Button>
          </div>
          <AssetPicker
            open={assetPickerOpen}
            onOpenChange={setAssetPickerOpen}
            onSelect={(imageUrl) => setValue({ ...value, imageUrl })}
          />
          {value.imageUrl && (
            <img
              src={value.imageUrl}
              alt="Xem trước hero"
              className="h-auto w-full max-w-[150px] rounded-md object-cover"
            />
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            type="number"
            value={value.sortOrder}
            onChange={(e) =>
              setValue({ ...value, sortOrder: Number(e.target.value) })
            }
            className="w-24"
            aria-label="Thứ tự"
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={value.isActive}
              onChange={(e) =>
                setValue({ ...value, isActive: e.target.checked })
              }
            />{" "}
            Hiển thị
          </label>
        </div>
      </div>
      <DialogFooter className="shrink-0 border-t pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button
          onClick={() => onSave(value)}
          disabled={!value.title.trim() || !value.imageUrl.trim()}
        >
          <Save className="mr-2 h-4 w-4" />
          {submitLabel}
        </Button>
      </DialogFooter>
    </div>
  );
}

export default function HeroSlidesPage() {
  const token = getToken();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Slide | null>(null);
  const [creating, setCreating] = useState(false);
  const {
    data: slides = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["hero-slides"],
    queryFn: () =>
      apiClient<Slide[]>("/banners", { token }).then((r) => r.data),
  });
  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ["hero-slides"] });
  const closeDialog = () => {
    setCreating(false);
    setEditing(null);
  };
  const create = useMutation({
    mutationFn: (body: Form) =>
      apiClient("/banners", {
        method: "POST",
        body: {
          title: { vi: body.title },
          subtitle: { vi: body.content },
          imageUrl: body.imageUrl,
          sortOrder: body.sortOrder,
          isActive: body.isActive,
        },
        token,
      }),
    onSuccess: () => {
      refresh();
      closeDialog();
      toast.success("Đã tạo slide");
    },
  });
  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Form }) =>
      apiClient(`/banners/${id}`, {
        method: "PATCH",
        body: {
          title: { vi: body.title },
          subtitle: { vi: body.content },
          imageUrl: body.imageUrl,
          sortOrder: body.sortOrder,
          isActive: body.isActive,
        },
        token,
      }),
    onSuccess: () => {
      refresh();
      closeDialog();
      toast.success("Đã lưu slide");
    },
  });
  const remove = useMutation({
    mutationFn: (id: string) =>
      apiClient(`/banners/${id}`, { method: "DELETE", token }),
    onSuccess: () => {
      refresh();
      toast.success("Đã xóa slide");
    },
  });
  const form = editing
    ? {
        title: editing.title.vi || "",
        content: editing.subtitle.vi || "",
        imageUrl: editing.imageUrl,
        sortOrder: editing.sortOrder,
        isActive: editing.isActive,
      }
    : blank;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Slider trang chủ</h1>
          <p className="text-sm text-muted-foreground">
            Quản lý tiêu đề, nội dung và hình ảnh trang chủ.
          </p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm slide
        </Button>
      </div>
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <p className="p-6 text-sm text-muted-foreground">Đang tải...</p>
          ) : error ? (
            <p className="p-6 text-sm text-destructive">
              Không thể tải slider trang chủ. Kiểm tra lại Admin API.
            </p>
          ) : slides.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted-foreground">
              Chưa có slide. Bấm “Thêm slide” để tạo mới.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hình ảnh</TableHead>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Nội dung
                  </TableHead>
                  <TableHead>Thứ tự</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="w-24">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {slides.map((slide) => (
                  <TableRow key={slide.id}>
                    <TableCell>
                      {slide.imageUrl ? (
                        <img
                          src={slide.imageUrl}
                          alt=""
                          className="h-12 w-20 rounded object-cover"
                        />
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {slide.title.vi || "—"}
                    </TableCell>
                    <TableCell className="hidden max-w-sm truncate text-muted-foreground md:table-cell">
                      {slide.subtitle.vi || "—"}
                    </TableCell>
                    <TableCell>{slide.sortOrder}</TableCell>
                    <TableCell>
                      <span
                        className={
                          slide.isActive
                            ? "text-green-600"
                            : "text-muted-foreground"
                        }
                      >
                        {slide.isActive ? "Hiển thị" : "Ẩn"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditing(slide)}
                          aria-label="Chỉnh sửa slide"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => remove.mutate(slide.id)}
                          aria-label="Xóa slide"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <Dialog
        open={creating || !!editing}
        onOpenChange={(open) => !open && closeDialog()}
      >
        <div className="flex min-h-[500px] max-h-[calc(90vh-3rem)] flex-col">
          <DialogHeader className="shrink-0">
            <DialogTitle>
              {editing ? "Chỉnh sửa slide" : "Thêm slide"}
            </DialogTitle>
            <DialogDescription>
              Nhập nội dung và chọn ảnh hiển thị cho Hero Slider.
            </DialogDescription>
          </DialogHeader>
          <SlideEditor
            key={editing?.id ?? "new"}
            initial={form}
            onCancel={closeDialog}
            onSave={(value) =>
              editing
                ? update.mutate({ id: editing.id, body: value })
                : create.mutate(value)
            }
            submitLabel={editing ? "Lưu thay đổi" : "Tạo slide"}
          />
        </div>
      </Dialog>
    </div>
  );
}
