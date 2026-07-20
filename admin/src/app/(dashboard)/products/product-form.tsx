"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import dynamic from "next/dynamic"
import { apiClient, getToken } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import { ImageUploader } from "@/components/shared/image-uploader"
import { AssetPicker } from "@/components/shared/asset-picker"
import { Skeleton } from "@/components/ui/skeleton"
import { Loader2, ImageIcon, Trash2 } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

const CKEditor = dynamic(
  () => import("@ckeditor/ckeditor5-react").then((mod) => mod.CKEditor),
  { ssr: false, loading: () => <Skeleton className="h-72 w-full" /> },
)

const locales = ["en", "vi", "de"] as const;
const DEFAULT_LOCALE = "vi";

type Category = { id: string; name: Record<string, string>; slug: string };
type Brand = { id: string; name: Record<string, string>; slug: string };
type Image = { id: string; url: string; sortOrder: number };

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
        const formData = new FormData();
        formData.append("file", file);
        const token = getToken();
        const baseUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL || "http://localhost:3002/api/v1/admin";
        const res = await fetch(`${baseUrl}/uploads/upload`, {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error?.message || "Upload failed");
        return { default: json.data.url };
      },
    };
  };
}

function slugify(text: string): string {
  const map: Record<string, string> = {
    à: "a", á: "a", ả: "a", ã: "a", ạ: "a", ă: "a", ằ: "a", ắ: "a", ẳ: "a", ẵ: "a", ặ: "a",
    â: "a", ầ: "a", ấ: "a", ẩ: "a", ẫ: "a", ậ: "a",
    è: "e", é: "e", ẻ: "e", ẽ: "e", ẹ: "e", ê: "e", ề: "e", ế: "e", ể: "e", ễ: "e", ệ: "e",
    ì: "i", í: "i", ỉ: "i", ĩ: "i", ị: "i",
    ò: "o", ó: "o", ỏ: "o", õ: "o", ọ: "o", ô: "o", ồ: "o", ố: "o", ổ: "o", ỗ: "o", ộ: "o",
    ơ: "o", ờ: "o", ớ: "o", ở: "o", ỡ: "o", ợ: "o",
    ù: "u", ú: "u", ủ: "u", ũ: "u", ụ: "u", ư: "u", ừ: "u", ứ: "u", ử: "u", ữ: "u", ự: "u",
    ỳ: "y", ý: "y", ỷ: "y", ỹ: "y", ỵ: "y",
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

export function ProductForm({ defaultValues, onSubmit, isSubmitting, productId, images, onAddImage, onDeleteImage }: ProductFormProps) {
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
    queryFn: () => apiClient<{ items: Category[] }>("/categories", { params: { limit: 200 }, token }),
    select: (res) => res.data?.items || [],
  });

  const { data: brands } = useQuery({
    queryKey: ["brands", "all-select"],
    queryFn: () => apiClient<{ items: Brand[] }>("/brands", { params: { limit: 200 }, token }),
    select: (res) => res.data?.items || [],
  });

  const [currentLocale, setCurrentLocale] = useState(DEFAULT_LOCALE);
  const [showAllLocales, setShowAllLocales] = useState(false);

  const [name, setName] = useState<Record<string, string>>({});
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState<Record<string, string>>({});
  const [sortDescription, setSortDescription] = useState<Record<string, string>>({});
  const [detail, setDetail] = useState<Record<string, string>>({});
  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [basePrice, setBasePrice] = useState(0);
  const [taxRate, setTaxRate] = useState(10);
  const [weight, setWeight] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [metaTitle, setMetaTitle] = useState<Record<string, string>>({});
  const [metaDesc, setMetaDesc] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [showEditor, setShowEditor] = useState(false);
  const [thumbAssetPickerOpen, setThumbAssetPickerOpen] = useState(false);
  const [galleryPickerOpen, setGalleryPickerOpen] = useState(false);

  useEffect(() => {
    if (defaultValues) {
      setName((defaultValues.name as Record<string, string>) || {});
      setSlug((defaultValues.slug as string) || "");
      setDescription((defaultValues.description as Record<string, string>) || {});
      setSortDescription((defaultValues.sortDescription as Record<string, string>) || {});
      setDetail((defaultValues.detail as Record<string, string>) || {});
      setCategoryId((defaultValues.categoryId as string) || (defaultValues.category as { id: string })?.id || "");
      setBrandId((defaultValues.brandId as string) || (defaultValues.brand as { id: string })?.id || "");
      setBasePrice((defaultValues.basePrice as number) ?? 0);
      setTaxRate((defaultValues.taxRate as number) ?? 10);
      setWeight((defaultValues.weight as number) ?? 0);
      setIsActive(defaultValues.isActive !== undefined ? Boolean(defaultValues.isActive) : true);
      setIsFeatured(defaultValues.isFeatured !== undefined ? Boolean(defaultValues.isFeatured) : false);
      setMetaTitle((defaultValues.metaTitle as Record<string, string>) || {});
      setMetaDesc((defaultValues.metaDesc as Record<string, string>) || {});
    }
  }, [defaultValues]);

  const setField = useCallback((field: string, locale: string, value: string) => {
    const setter: Record<string, React.Dispatch<React.SetStateAction<Record<string, string>>>> = {
      name: setName,
      description: setDescription,
      sortDescription: setSortDescription,
      detail: setDetail,
      metaTitle: setMetaTitle,
      metaDesc: setMetaDesc,
    };
    setter[field]?.((prev) => ({ ...prev, [locale]: value }));
  }, []);

  const getField = useCallback((field: string, locale: string): string => {
    const source: Record<string, Record<string, string>> = { name, description, sortDescription, detail, metaTitle, metaDesc };
    return source[field]?.[locale] || "";
  }, [name, description, detail, metaTitle, metaDesc]);

  function handleNameChange(value: string) {
    setName((prev) => ({ ...prev, [currentLocale]: value }));
    if (!slugEdited.current) {
      setSlug(slugify(value));
    }
  }

  function handleSlugChange(value: string) {
    slugEdited.current = true;
    setSlug(value);
  }

  const activeLocales = showAllLocales ? [...locales] : [currentLocale];
  const thumbnailUrl = images?.find((img) => img.sortOrder === 0)?.url || images?.[0]?.url;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!(name.vi || name.en)) newErrors.name = "Product name is required";
    if (!slug.trim()) newErrors.slug = "Slug is required";
    else if (!/^[a-z0-9-]+$/.test(slug)) newErrors.slug = "Invalid slug format (lowercase, numbers, hyphens only)";
    if (!categoryId) newErrors.categoryId = "Category is required";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const data: Record<string, unknown> = {
      name,
      slug,
      categoryId,
      isActive,
      isFeatured,
      basePrice: Number(basePrice),
      taxRate: Number(taxRate),
      weight: Number(weight),
      detail,
    };
    if (brandId) data.brandId = brandId;
    if (Object.keys(description).length > 0) data.description = description;
    if (Object.keys(sortDescription).length > 0) data.sortDescription = sortDescription;
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
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Product Information</h3>
                <button
                  type="button"
                  onClick={() => setShowAllLocales(!showAllLocales)}
                  className="text-xs text-muted-foreground hover:text-foreground underline"
                >
                  {showAllLocales ? "Single language" : "All languages"}
                </button>
              </div>

              {activeLocales.map((l) => (
                <div key={`name-${l}`} className="space-y-1">
                  {showAllLocales && <Label className="text-xs uppercase text-muted-foreground">Name ({l})</Label>}
                  <Input
                    value={getField("name", l)}
                    onChange={(e) => {
                      if (l === currentLocale) {
                        handleNameChange(e.target.value);
                      } else {
                        setField("name", l, e.target.value);
                      }
                    }}
                    placeholder={`Product name${showAllLocales ? ` (${l})` : ""}`}
                  />
                </div>
              ))}
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}

              <div className="space-y-1">
                <Label htmlFor="slug">Slug</Label>
                <Input id="slug" value={slug} onChange={(e) => handleSlugChange(e.target.value)} placeholder="product-slug" />
                {errors.slug && <p className="text-xs text-destructive">{errors.slug}</p>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="text-sm font-medium">Detail</h3>
              <div className="min-h-[300px]">
                {activeLocales.map((l) => (
                  <div key={`detail-${l}`} className={l !== currentLocale && !showAllLocales ? "hidden" : ""}>
                    {showAllLocales && <Label className="text-xs uppercase text-muted-foreground mb-1 block">{l}</Label>}
                    {showEditor && editorRef.current ? (
                      <CKEditor
                        key={`ck-${l}`}
                        editor={editorRef.current}
                        data={getField("detail", l)}
                        onChange={(_event: any, editor: any) => {
                          setField("detail", l, editor.getData());
                        }}
                        config={{
                          toolbar: ["heading", "|", "bold", "italic", "link", "bulletedList", "numberedList", "|", "blockQuote", "insertTable", "imageUpload", "|", "undo", "redo"],
                          image: {
                            toolbar: ["imageTextAlternative", "imageStyle:inline", "imageStyle:block", "imageStyle:side"],
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
              <h3 className="text-sm font-medium">Short Description</h3>
              {activeLocales.map((l) => (
                <div key={`desc-${l}`} className="space-y-1">
                  {showAllLocales && <Label className="text-xs uppercase text-muted-foreground">{l}</Label>}
                  <textarea
                    value={getField("description", l)}
                    onChange={(e) => setField("description", l, e.target.value)}
                    placeholder={`Short description${showAllLocales ? ` (${l})` : ""}`}
                    rows={3}
                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="text-sm font-medium">Sort Description (shown in product card)</h3>
              {activeLocales.map((l) => (
                <div key={`sort-desc-${l}`} className="space-y-1">
                  {showAllLocales && <Label className="text-xs uppercase text-muted-foreground">{l}</Label>}
                  <textarea
                    value={getField("sortDescription", l)}
                    onChange={(e) => setField("sortDescription", l, e.target.value)}
                    placeholder={`Brief product summary for listings${showAllLocales ? ` (${l})` : ""}`}
                    rows={2}
                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="text-sm font-medium">Categorization</h3>
              <div className="space-y-1">
                <Label htmlFor="categoryId">Category *</Label>
                <select id="categoryId" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm">
                  <option value="">Select category...</option>
                  {(categories as Category[] | undefined)?.map((c) => (
                    <option key={c.id} value={c.id}>{c.name?.en || c.name?.vi || c.slug}</option>
                  ))}
                </select>
                {errors.categoryId && <p className="text-xs text-destructive">{errors.categoryId}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="brandId">Brand</Label>
                <select id="brandId" value={brandId} onChange={(e) => setBrandId(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm">
                  <option value="">No brand</option>
                  {(brands as Brand[] | undefined)?.map((b) => (
                    <option key={b.id} value={b.id}>{b.name?.en || b.name?.vi || b.slug}</option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="text-sm font-medium">Pricing & Properties</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="basePrice">Base Price (VND)</Label>
                  <Input id="basePrice" type="number" min={0} value={basePrice} onChange={(e) => setBasePrice(Number(e.target.value))} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input id="taxRate" type="number" min={0} max={100} value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="weight">Weight (g)</Label>
                  <Input id="weight" type="number" min={0} value={weight} onChange={(e) => setWeight(Number(e.target.value))} />
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
                  <Label htmlFor="isActive">Active</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="isFeatured" checked={isFeatured} onCheckedChange={setIsFeatured} />
                  <Label htmlFor="isFeatured">Featured</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="text-sm font-medium">SEO (optional)</h3>
              {activeLocales.map((l) => (
                <div key={`meta-${l}`} className="space-y-2">
                  {showAllLocales && <Label className="text-xs uppercase text-muted-foreground">{l}</Label>}
                  <Input
                    value={getField("metaTitle", l)}
                    onChange={(e) => setField("metaTitle", l, e.target.value)}
                    placeholder={`Meta title${showAllLocales ? ` (${l})` : ""}`}
                  />
                  <Input
                    value={getField("metaDesc", l)}
                    onChange={(e) => setField("metaDesc", l, e.target.value)}
                    placeholder={`Meta description${showAllLocales ? ` (${l})` : ""}`}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="text-sm font-medium">Thumbnail</h3>
              <p className="text-xs text-muted-foreground">Main product image shown in listings</p>
              {thumbnailUrl ? (
                <div className="relative inline-block group">
                  <img src={thumbnailUrl} alt="Thumbnail" className="h-40 w-40 rounded-md border object-cover" />
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
                      queryClient.invalidateQueries({ queryKey: ["product", productId] });
                    }
                  }}
                />
                <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => setThumbAssetPickerOpen(true)}>
                  <ImageIcon className="h-4 w-4" /> Browse Assets
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
              <h3 className="text-sm font-medium">Gallery Images</h3>
              <p className="text-xs text-muted-foreground">Additional product detail images</p>

              <ImageUploader
                entityType="product"
                entityId={productId}
                multiple
                queryKey={productId ? ["product", productId] : undefined}
                onUploadComplete={(img) => {
                  if (img?.url) onAddImage?.(img.url);
                }}
              />

              <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => setGalleryPickerOpen(true)}>
                <ImageIcon className="h-4 w-4" /> Browse Assets
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
                    <div key={img.id} className="group relative rounded-md border overflow-hidden">
                      <img src={img.url} alt="" className="aspect-square object-cover" />
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
          {defaultValues ? "Update Product" : "Create Product"}
        </Button>
        <Button variant="outline" asChild><Link href="/products">Cancel</Link></Button>
      </div>
    </form>
  );
}
