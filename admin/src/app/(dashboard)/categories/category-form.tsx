"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient, getToken } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import Link from "next/link";

type Category = { id: string; name: Record<string, string>; slug: string };
type CategoryFormProps = {
  defaultValues?: Record<string, unknown>;
  onSubmit: (data: Record<string, unknown>) => void;
  isSubmitting: boolean;
};

export function CategoryForm({
  defaultValues,
  onSubmit,
  isSubmitting,
}: CategoryFormProps) {
  const token = getToken();
  const { data: categories = [] } = useQuery({
    queryKey: ["categories", "all"],
    queryFn: () =>
      apiClient<{ items: Category[] }>("/categories", {
        params: { limit: 200, sort: "sortOrder:asc" },
        token,
      }).then((res) => res.data.items),
  });
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  useEffect(() => {
    const value = defaultValues ?? {};
    const names = value.name as Record<string, string> | undefined;
    const descriptions = value.description as
      | Record<string, string>
      | undefined;
    setName(names?.vi ?? "");
    setSlug((value.slug as string) ?? "");
    setDescription(descriptions?.vi ?? "");
    setParentId((value.parentId as string) ?? "");
    setImageUrl((value.imageUrl as string) ?? "");
    setIsActive(value.isActive === undefined ? true : Boolean(value.isActive));
    setSortOrder((value.sortOrder as number) ?? 0);
  }, [defaultValues]);
  function submit(event: React.FormEvent) {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Vui lòng nhập tên danh mục";
    if (!slug.trim()) next.slug = "Vui lòng nhập đường dẫn";
    else if (!/^[a-z0-9-]+$/.test(slug))
      next.slug = "Đường dẫn chỉ gồm chữ thường, số và dấu gạch ngang";
    setErrors(next);
    if (Object.keys(next).length) return;
    onSubmit({
      name: { vi: name.trim() },
      slug,
      description: { vi: description.trim() },
      parentId: parentId || undefined,
      imageUrl,
      isActive,
      sortOrder,
    });
  }
  const parents = categories.filter(
    (category) => category.id !== defaultValues?.id,
  );
  return (
    <form onSubmit={submit} className="max-w-2xl space-y-6">
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-1">
            <Label htmlFor="category-name">Tên danh mục</Label>
            <Input
              id="category-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Tên danh mục"
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="slug">Đường dẫn (slug)</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              placeholder="ten-danh-muc"
            />
            {errors.slug && (
              <p className="text-xs text-destructive">{errors.slug}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="description">Mô tả</Label>
            <textarea
              id="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Mô tả danh mục"
              className="flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
            />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-1">
            <Label htmlFor="parentId">Danh mục cha</Label>
            <select
              id="parentId"
              value={parentId}
              onChange={(event) => setParentId(event.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
            >
              <option value="">Không có (danh mục cấp cao nhất)</option>
              {parents.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name.vi || category.name.en || category.slug}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="imageUrl">URL hình ảnh</Label>
            <Input
              id="imageUrl"
              value={imageUrl}
              onChange={(event) => setImageUrl(event.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="sortOrder">Thứ tự hiển thị</Label>
            <Input
              id="sortOrder"
              type="number"
              min={0}
              value={sortOrder}
              onChange={(event) => setSortOrder(Number(event.target.value))}
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
            <Label htmlFor="isActive">Đang hoạt động</Label>
          </div>
        </CardContent>
      </Card>
      <div className="flex items-center gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {defaultValues ? "Lưu thay đổi" : "Tạo danh mục"}
        </Button>
        <Button variant="outline" asChild>
          <Link href="/categories">Hủy</Link>
        </Button>
      </div>
    </form>
  );
}
