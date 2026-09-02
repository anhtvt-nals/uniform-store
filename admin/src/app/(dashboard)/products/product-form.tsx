"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { apiClient, getToken } from "@/lib/api";
import { uploadImage } from "@/lib/image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { ImageUploader } from "@/components/shared/image-uploader";
import { AssetPicker } from "@/components/shared/asset-picker";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, ImageIcon, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

const CKEditor = dynamic(
  () => import("@ckeditor/ckeditor5-react").then((mod) => mod.CKEditor),
  { ssr: false, loading: () => <Skeleton className="h-72 w-full" /> },
);

const DEFAULT_LOCALE = "vi";

type Category = { id: string; name: Record<string, string>; slug: string };
type Brand = { id: string; name: Record<string, string>; slug: string };
type Image = { id: string; url: string; sortOrder: number };
type Size = {
  id: string;
  code: string;
  weightRange: string;
  isActive: boolean;
};

type ProductFormProps = {
  defaultValues?: Record<string, unknown>;
  onSubmit: (data: Record<string, unknown>) => void;
  isSubmitting: boolean;
  productId?: string;
  images?: Image[];
  onAddImage?: (url: string) => void;
  onDeleteImage?: (id: string) => void;
};

function MyCustomUploadAdapterPlugin(editor: any) {
  editor.plugins.get("FileRepository").createUploadAdapter = (loader: any) => {
    return {
      upload: async () => {
        const file = await loader.file;
        const token = getToken();
        const image = await uploadImage(file, token);
        return { default: image.url };
      },
    };
  };
}

function slugify(text: string): string {
  const map: Record<string, string> = {
    à: "a",
    á: "a",
    ả: "a",
    ã: "a",
    ạ: "a",
    ă: "a",
    ằ: "a",
    ắ: "a",
    ẳ: "a",
    ẵ: "a",
    ặ: "a",
    â: "a",
    ầ: "a",
    ấ: "a",
    ẩ: "a",
    ẫ: "a",
    ậ: "a",
    è: "e",
    é: "e",
    ẻ: "e",
    ẽ: "e",
    ẹ: "e",
    ê: "e",
    ề: "e",
    ế: "e",
    ể: "e",
    ễ: "e",
    ệ: "e",
    ì: "i",
    í: "i",
    ỉ: "i",
    ĩ: "i",
    ị: "i",
    ò: "o",
    ó: "o",
    ỏ: "o",
    õ: "o",
    ọ: "o",
    ô: "o",
    ồ: "o",
    ố: "o",
    ổ: "o",
    ỗ: "o",
    ộ: "o",
    ơ: "o",
    ờ: "o",
    ớ: "o",
    ở: "o",
    ỡ: "o",
    ợ: "o",
    ù: "u",
    ú: "u",
    ủ: "u",
    ũ: "u",
    ụ: "u",
    ư: "u",
    ừ: "u",
    ứ: "u",
    ử: "u",
    ữ: "u",
    ự: "u",
    ỳ: "y",
    ý: "y",
    ỷ: "y",
    ỹ: "y",
    ỵ: "y",
    đ: "d",
  };
  return text
    .toLowerCase()
    .split("")
    .map((c) => map[c] || c)
    .join("")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function ProductForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  productId,
  images,
  onAddImage,
  onDeleteImage,
}: ProductFormProps) {
  const token = getToken();
  const queryClient = useQueryClient();
  const slugEdited = useRef(false);
  const editorRef = useRef<any>(null);

  useEffect(() => {
    import("@ckeditor/ckeditor5-build-classic").then((mod) => {
      editorRef.current = mod.default;
      setShowEditor(true);
    });
  }, []);

  const { data: categories } = useQuery({
    queryKey: ["categories", "all-select"],
    queryFn: () =>
      apiClient<{ items: Category[] }>("/categories", {
        params: { limit: 200 },
        token,
      }),
    select: (res) => res.data?.items || [],
  });

  const { data: brands } = useQuery({
    queryKey: ["brands", "all-select"],
    queryFn: () =>
      apiClient<{ items: Brand[] }>("/brands", {
        params: { limit: 200 },
        token,
      }),
    select: (res) => res.data?.items || [],
  });
  const { data: sizes = [] } = useQuery({
    queryKey: ["sizes", "product-form"],
    queryFn: () => apiClient<Size[]>("/sizes", { token }),
    select: (res) => (res.data || []).filter((size) => size.isActive),
  });

  const [name, setName] = useState<Record<string, string>>({});
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState<Record<string, string>>({});
  const [detail, setDetail] = useState<Record<string, string>>({});
  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [isContactPrice, setIsContactPrice] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [metaTitle, setMetaTitle] = useState<Record<string, string>>({});
  const [metaDesc, setMetaDesc] = useState<Record<string, string>>({});
  const [sizeIds, setSizeIds] = useState<string[]>([]);
  const [sizeGuideImageUrl, setSizeGuideImageUrl] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [showEditor, setShowEditor] = useState(false);
  const [thumbAssetPickerOpen, setThumbAssetPickerOpen] = useState(false);
  const [galleryPickerOpen, setGalleryPickerOpen] = useState(false);
  const [sizeGuidePickerOpen, setSizeGuidePickerOpen] = useState(false);

  useEffect(() => {
    if (defaultValues) {
      setName((defaultValues.name as Record<string, string>) || {});
      setSlug((defaultValues.slug as string) || "");
      setDescription(
        (defaultValues.description as Record<string, string>) || {},
      );
      setDetail((defaultValues.detail as Record<string, string>) || {});
      setCategoryId(
        (defaultValues.categoryId as string) ||
          (defaultValues.category as { id: string })?.id ||
          "",
      );
      setBrandId(
        (defaultValues.brandId as string) ||
          (defaultValues.brand as { id: string })?.id ||
          "",
      );
      setBasePrice(
        defaultValues.basePrice !== undefined &&
          defaultValues.basePrice !== null
          ? String(defaultValues.basePrice)
          : "",
      );
      setIsContactPrice(Boolean(defaultValues.isContactPrice));
      setIsActive(
        defaultValues.isActive !== undefined
          ? Boolean(defaultValues.isActive)
          : true,
      );
      setIsFeatured(
        defaultValues.isFeatured !== undefined
          ? Boolean(defaultValues.isFeatured)
          : false,
      );
      setMetaTitle((defaultValues.metaTitle as Record<string, string>) || {});
      setMetaDesc((defaultValues.metaDesc as Record<string, string>) || {});
      setSizeIds(
        ((defaultValues.sizes as Size[] | undefined) || []).map(
          (size) => size.id,
        ),
      );
      setSizeGuideImageUrl((defaultValues.sizeGuideImageUrl as string) || "");
    }
  }, [defaultValues]);

  const setField = useCallback(
    (field: string, locale: string, value: string) => {
      const setter: Record<
        string,
        React.Dispatch<React.SetStateAction<Record<string, string>>>
      > = {
        name: setName,
        description: setDescription,
        detail: setDetail,
        metaTitle: setMetaTitle,
        metaDesc: setMetaDesc,
      };
      setter[field]?.((prev) => ({ ...prev, [locale]: value }));
    },
    [],
  );

  const getField = useCallback(
    (field: string, locale: string): string => {
      const source: Record<string, Record<string, string>> = {
        name,
        description,
        detail,
        metaTitle,
        metaDesc,
      };
      return source[field]?.[locale] || "";
    },
    [name, description, detail, metaTitle, metaDesc],
  );

  function handleNameChange(value: string) {
    setName((prev) => ({ ...prev, [DEFAULT_LOCALE]: value }));
    if (!slugEdited.current) {
      setSlug(slugify(value));
    }
  }

  function handleSlugChange(value: string) {
    slugEdited.current = true;
    setSlug(value);
  }

  const activeLocales = [DEFAULT_LOCALE];
  const thumbnailUrl =
    images?.find((img) => img.sortOrder === 0)?.url || images?.[0]?.url;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!name.vi) newErrors.name = "Vui lòng nhập tên sản phẩm";
    if (!slug.trim()) newErrors.slug = "Vui lòng nhập slug";
    else if (!/^[a-z0-9-]+$/.test(slug))
      newErrors.slug = "Slug chỉ gồm chữ thường, số và dấu gạch ngang";
    if (!categoryId) newErrors.categoryId = "Vui lòng chọn danh mục";
    if (
      !isContactPrice &&
      basePrice &&
      (!Number.isInteger(Number(basePrice)) || Number(basePrice) < 0)
    )
      newErrors.basePrice = "Giá phải là số VNĐ nguyên, không âm";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const data: Record<string, unknown> = {
      name,
      slug,
      categoryId,
      isActive,
      isFeatured,
      detail,
      basePrice: isContactPrice ? 0 : basePrice ? Number(basePrice) : 0,
      isContactPrice,
      sizeIds,
      sizeGuideImageUrl,
    };
    if (brandId) data.brandId = brandId;
    if (Object.keys(description).length > 0) data.description = description;
    if (Object.keys(description).length > 0) data.sortDescription = description;
    if (Object.keys(metaTitle).length > 0) data.metaTitle = metaTitle;
    if (Object.keys(metaDesc).length > 0) data.metaDesc = metaDesc;

    onSubmit(data);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="text-sm font-medium">Thông tin sản phẩm</h3>

              {activeLocales.map((l) => (
                <div key={`name-${l}`} className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Tên sản phẩm
                  </Label>
                  <Input
                    value={getField("name", l)}
                    onChange={(e) => {
                      if (l === DEFAULT_LOCALE) {
                        handleNameChange(e.target.value);
                      } else {
                        setField("name", l, e.target.value);
                      }
                    }}
                    placeholder="Tên sản phẩm"
                  />
                </div>
              ))}
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}

              <div className="space-y-1">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="product-slug"
                />
                {errors.slug && (
                  <p className="text-xs text-destructive">{errors.slug}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="basePrice">Giá tham khảo ban đầu (VNĐ)</Label>
                <Input
                  id="basePrice"
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  placeholder="Ví dụ: 250000"
                  disabled={isContactPrice}
                />
                <div className="flex items-center gap-3 pt-1">
                  <Switch
                    id="isContactPrice"
                    checked={isContactPrice}
                    onCheckedChange={setIsContactPrice}
                  />
                  <Label
                    htmlFor="isContactPrice"
                    className="cursor-pointer text-sm font-medium"
                  >
                    Giá liên hệ
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Khi bật, giá sản phẩm được lưu là 0 và storefront luôn hiển
                  thị “Giá liên hệ”, bỏ qua giá từng mã sản phẩm.
                </p>
                {errors.basePrice && (
                  <p className="text-xs text-destructive">{errors.basePrice}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <h3 className="text-sm font-medium">Kích thước sản phẩm</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Chọn các size khách hàng có thể đặt cho sản phẩm này.
                </p>
              </div>
              {sizes.length ? (
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => {
                    const checked = sizeIds.includes(size.id);
                    return (
                      <label
                        key={size.id}
                        className={`cursor-pointer rounded-md border px-3 py-2 text-sm transition-colors ${checked ? "border-primary bg-primary text-primary-foreground" : "border-input hover:border-primary/50"}`}
                      >
                        <input
                          className="sr-only"
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            setSizeIds((current) =>
                              checked
                                ? current.filter((id) => id !== size.id)
                                : [...current, size.id],
                            )
                          }
                        />
                        <span className="font-semibold">{size.code}</span>
                        {size.weightRange ? (
                          <span
                            className={`ml-1 ${checked ? "text-primary-foreground/85" : "text-muted-foreground"}`}
                          >
                            ({size.weightRange})
                          </span>
                        ) : null}
                      </label>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Chưa có size. Hãy tạo size trong mục Kích thước trước.
                </p>
              )}
              <div className="space-y-2 border-t pt-4">
                <Label>Ảnh hướng dẫn chọn size</Label>
                {sizeGuideImageUrl ? (
                  <img
                    src={sizeGuideImageUrl}
                    alt="Bảng hướng dẫn size"
                    className="max-h-48 rounded-md border object-contain"
                  />
                ) : null}
                <ImageUploader
                  entityType="product-size-guide"
                  entityId={productId}
                  onUploadComplete={(image) =>
                    image?.url && setSizeGuideImageUrl(image.url)
                  }
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setSizeGuidePickerOpen(true)}
                >
                  <ImageIcon className="size-4" /> Chọn từ assets
                </Button>
                <AssetPicker
                  open={sizeGuidePickerOpen}
                  onOpenChange={setSizeGuidePickerOpen}
                  onSelect={(url) => {
                    setSizeGuideImageUrl(url);
                    setSizeGuidePickerOpen(false);
                  }}
                />
                {sizeGuideImageUrl ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSizeGuideImageUrl("")}
                  >
                    Xóa ảnh hướng dẫn
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="text-sm font-medium">Mô tả chi tiết</h3>
              <div className="min-h-[300px]">
                {activeLocales.map((l) => (
                  <div key={`detail-${l}`}>
                    {showEditor && editorRef.current ? (
                      <CKEditor
                        key={`ck-${l}`}
                        editor={editorRef.current}
                        data={getField("detail", l)}
                        onChange={(_event: any, editor: any) => {
                          setField("detail", l, editor.getData());
                        }}
                        config={{
                          toolbar: [
                            "heading",
                            "|",
                            "bold",
                            "italic",
                            "link",
                            "bulletedList",
                            "numberedList",
                            "|",
                            "blockQuote",
                            "insertTable",
                            "imageUpload",
                            "|",
                            "undo",
                            "redo",
                          ],
                          image: {
                            toolbar: [
                              "imageTextAlternative",
                              "imageStyle:inline",
                              "imageStyle:block",
                              "imageStyle:side",
                            ],
                          },
                          extraPlugins: [MyCustomUploadAdapterPlugin],
                        }}
                      />
                    ) : (
                      <Skeleton className="h-72 w-full" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="text-sm font-medium">Mô tả ngắn</h3>
              {activeLocales.map((l) => (
                <div key={`desc-${l}`} className="space-y-1">
                  <textarea
                    value={getField("description", l)}
                    onChange={(e) => setField("description", l, e.target.value)}
                    placeholder="Mô tả ngắn hiển thị trên card sản phẩm"
                    rows={3}
                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="text-sm font-medium">Phân loại</h3>
              <div className="space-y-1">
                <Label htmlFor="categoryId">Danh mục *</Label>
                <select
                  id="categoryId"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm"
                >
                  <option value="">Chọn danh mục...</option>
                  {(categories as Category[] | undefined)?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name?.vi || c.name?.en || c.slug}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="text-xs text-destructive">
                    {errors.categoryId}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="brandId">Thương hiệu</Label>
                <select
                  id="brandId"
                  value={brandId}
                  onChange={(e) => setBrandId(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm"
                >
                  <option value="">Không có thương hiệu</option>
                  {(brands as Brand[] | undefined)?.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name?.vi || b.name?.en || b.slug}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="text-sm font-medium">Trạng thái hiển thị</h3>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    id="isActive"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                  />
                  <Label htmlFor="isActive">Hiển thị</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="isFeatured"
                    checked={isFeatured}
                    onCheckedChange={setIsFeatured}
                  />
                  <Label htmlFor="isFeatured">Nổi bật</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="text-sm font-medium">SEO (không bắt buộc)</h3>
              {activeLocales.map((l) => (
                <div key={`meta-${l}`} className="space-y-2">
                  <Input
                    value={getField("metaTitle", l)}
                    onChange={(e) => setField("metaTitle", l, e.target.value)}
                    placeholder="Tiêu đề SEO"
                  />
                  <Input
                    value={getField("metaDesc", l)}
                    onChange={(e) => setField("metaDesc", l, e.target.value)}
                    placeholder="Mô tả SEO"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="text-sm font-medium">Ảnh đại diện</h3>
              <p className="text-xs text-muted-foreground">
                Ảnh chính hiển thị trong danh sách sản phẩm
              </p>
              {thumbnailUrl ? (
                <div className="relative inline-block group">
                  <img
                    src={thumbnailUrl}
                    alt="Ảnh đại diện"
                    className="h-40 w-40 rounded-md border object-cover"
                  />
                  {onDeleteImage && images?.[0] && (
                    <button
                      type="button"
                      onClick={() => onDeleteImage(images[0].id)}
                      className="absolute top-1 right-1 rounded-full bg-background/80 p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:opacity-100"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="h-40 w-40 rounded-md border border-dashed flex items-center justify-center text-muted-foreground">
                  <ImageIcon className="h-6 w-6" />
                </div>
              )}
              <div className="space-y-2">
                <ImageUploader
                  entityType="product"
                  entityId={productId}
                  onUploadComplete={(img) => {
                    if (img?.url) onAddImage?.(img.url);
                    if (productId) {
                      queryClient.invalidateQueries({
                        queryKey: ["product", productId],
                      });
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setThumbAssetPickerOpen(true)}
                >
                  <ImageIcon className="h-4 w-4" /> Chọn từ assets
                </Button>
                <AssetPicker
                  open={thumbAssetPickerOpen}
                  onOpenChange={setThumbAssetPickerOpen}
                  onSelect={(url) => {
                    onAddImage?.(url);
                    setThumbAssetPickerOpen(false);
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="text-sm font-medium">Thư viện ảnh</h3>
              <p className="text-xs text-muted-foreground">
                Các hình ảnh bổ sung cho sản phẩm
              </p>

              <ImageUploader
                entityType="product"
                entityId={productId}
                multiple
                queryKey={productId ? ["product", productId] : undefined}
                onUploadComplete={(img) => {
                  if (img?.url) onAddImage?.(img.url);
                }}
              />

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setGalleryPickerOpen(true)}
              >
                <ImageIcon className="h-4 w-4" /> Chọn từ assets
              </Button>
              <AssetPicker
                open={galleryPickerOpen}
                onOpenChange={setGalleryPickerOpen}
                onSelect={(url) => {
                  onAddImage?.(url);
                  setGalleryPickerOpen(false);
                }}
              />

              {images && images.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {images.map((img) => (
                    <div
                      key={img.id}
                      className="group relative rounded-md border overflow-hidden"
                    >
                      <img
                        src={img.url}
                        alt=""
                        className="aspect-square object-cover"
                      />
                      {onDeleteImage && (
                        <button
                          type="button"
                          onClick={() => onDeleteImage(img.id)}
                          className="absolute top-0.5 right-0.5 rounded-full bg-background/80 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity hover:opacity-100"
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {defaultValues ? "Lưu sản phẩm" : "Tạo sản phẩm"}
        </Button>
        <Button variant="outline" asChild>
          <Link href="/products">Hủy</Link>
        </Button>
      </div>
    </form>
  );
}
