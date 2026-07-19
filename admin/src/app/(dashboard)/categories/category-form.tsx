"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { apiClient, getToken } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import Link from "next/link"

const locales = ["en", "vi", "de"] as const;

type Category = {
  id: string;
  name: Record<string, string>;
  slug: string;
};

type CategoryFormProps = {
  defaultValues?: Record<string, unknown>;
  onSubmit: (data: Record<string, unknown>) => void;
  isSubmitting: boolean;
};

function toStr(val: unknown, fallback = ""): string {
  if (typeof val === "string") return val;
  if (typeof val === "object" && val !== null) {
    const r = val as Record<string, string>;
    return r.en || r.vi || fallback;
  }
  return fallback;
}

export function CategoryForm({ defaultValues, onSubmit, isSubmitting }: CategoryFormProps) {
  const token = getToken();

  const { data: categoriesData } = useQuery({
    queryKey: ["categories", "all"],
    queryFn: () => apiClient<{ items: Category[] }>("/categories", {
      params: { limit: 200, sort: "sortOrder:asc" },
      token,
    }),
    select: (res) => res.data?.items || [],
  });

  const parentCategories = (categoriesData as Category[] | undefined)?.filter(
    (c) => c.id !== (defaultValues?.id as string)
  ) || [];

  const [nameEn, setNameEn] = useState("");
  const [nameVi, setNameVi] = useState("");
  const [nameDe, setNameDe] = useState("");
  const [slug, setSlug] = useState("");
  const [descEn, setDescEn] = useState("");
  const [descVi, setDescVi] = useState("");
  const [descDe, setDescDe] = useState("");
  const [parentId, setParentId] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (defaultValues) {
      const name = defaultValues.name as Record<string, string> | undefined;
      setNameEn(name?.en || "");
      setNameVi(name?.vi || "");
      setNameDe(name?.de || "");
      setSlug((defaultValues.slug as string) || "");
      const desc = defaultValues.description as Record<string, string> | undefined;
      setDescEn(desc?.en || "");
      setDescVi(desc?.vi || "");
      setDescDe(desc?.de || "");
      setParentId((defaultValues.parentId as string) || "");
      setImageUrl((defaultValues.imageUrl as string) || "");
      setIsActive(defaultValues.isActive !== undefined ? Boolean(defaultValues.isActive) : true);
      setSortOrder((defaultValues.sortOrder as number) ?? 0);
    }
  }, [defaultValues]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!nameEn.trim()) newErrors.nameEn = "English name is required";
    if (!nameVi.trim()) newErrors.nameVi = "Vietnamese name is required";
    if (!nameDe.trim()) newErrors.nameDe = "German name is required";
    if (!slug.trim()) newErrors.slug = "Slug is required";
    else if (!/^[a-z0-9-]+$/.test(slug)) newErrors.slug = "Slug must be lowercase alphanumeric with hyphens";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const data: Record<string, unknown> = {
      name: { en: nameEn, vi: nameVi, de: nameDe },
      slug,
      isActive,
      sortOrder,
    };
    if (descEn || descVi || descDe) {
      data.description = { en: descEn, vi: descVi, de: descDe };
    }
    if (parentId) data.parentId = parentId;
    if (imageUrl) data.imageUrl = imageUrl;

    onSubmit(data);
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <h3 className="text-sm font-medium">Name (required)</h3>
          {locales.map((locale) => {
            const key = `name${locale.charAt(0).toUpperCase() + locale.slice(1)}` as "nameEn" | "nameVi" | "nameDe";
            const val = key === "nameEn" ? nameEn : key === "nameVi" ? nameVi : nameDe;
            const setter = key === "nameEn" ? setNameEn : key === "nameVi" ? setNameVi : setNameDe;
            return (
              <div key={locale} className="space-y-1">
                <Label htmlFor={`name-${locale}`} className="text-xs uppercase text-muted-foreground">
                  {locale}
                </Label>
                <Input
                  id={`name-${locale}`}
                  value={val}
                  onChange={(e) => setter(e.target.value)}
                  placeholder={`Category name (${locale})`}
                />
                {errors[key] && <p className="text-xs text-destructive">{errors[key]}</p>}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-1">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="category-slug" />
            {errors.slug && <p className="text-xs text-destructive">{errors.slug}</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <h3 className="text-sm font-medium">Description (optional)</h3>
          {locales.map((locale) => {
            const key = `desc${locale.charAt(0).toUpperCase() + locale.slice(1)}` as "descEn" | "descVi" | "descDe";
            const val = key === "descEn" ? descEn : key === "descVi" ? descVi : descDe;
            const setter = key === "descEn" ? setDescEn : key === "descVi" ? setDescVi : setDescDe;
            return (
              <div key={locale} className="space-y-1">
                <Label htmlFor={`desc-${locale}`} className="text-xs uppercase text-muted-foreground">
                  {locale}
                </Label>
                <textarea
                  id={`desc-${locale}`}
                  value={val}
                  onChange={(e) => setter(e.target.value)}
                  placeholder={`Description (${locale})`}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-1">
            <Label htmlFor="parentId">Parent Category</Label>
            <select
              id="parentId"
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            >
              <option value="">None (top-level)</option>
              {parentCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {toStr(c.name, c.slug)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input id="imageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
          </div>

          <div className="space-y-1">
            <Label htmlFor="sortOrder">Sort Order</Label>
            <Input id="sortOrder" type="number" min={0} value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} />
          </div>

          <div className="flex items-center gap-2">
            <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
            <Label htmlFor="isActive">Active</Label>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {defaultValues ? "Update Category" : "Create Category"}
        </Button>
        <Button variant="outline" asChild>
          <Link href="/categories">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
