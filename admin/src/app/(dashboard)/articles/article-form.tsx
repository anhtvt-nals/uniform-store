"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import dynamic from "next/dynamic"
import { getToken } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ImageUploader } from "@/components/shared/image-uploader"
import { AssetPicker } from "@/components/shared/asset-picker"
import { Loader2, ImageIcon, Trash2 } from "lucide-react"
import Link from "next/link"

const CKEditor = dynamic(
  () => import("@ckeditor/ckeditor5-react").then((mod) => mod.CKEditor),
  { ssr: false, loading: () => <Skeleton className="h-72 w-full" /> },
)

const locales = ["en", "vi", "de"] as const;
const DEFAULT_LOCALE = "vi";

type ArticleFormProps = {
  defaultValues?: Record<string, unknown>;
  onSubmit: (data: Record<string, unknown>) => void;
  isSubmitting: boolean;
  articleId?: string;
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

export function ArticleForm({ defaultValues, onSubmit, isSubmitting, articleId }: ArticleFormProps) {
  const slugEdited = useRef(false);
  const editorRef = useRef<any>(null);

  useEffect(() => {
    import("@ckeditor/ckeditor5-build-classic").then((mod) => {
      editorRef.current = mod.default;
      setShowEditor(true);
    });
  }, []);

  const [currentLocale, setCurrentLocale] = useState(DEFAULT_LOCALE);
  const [showAllLocales, setShowAllLocales] = useState(false);

  const [title, setTitle] = useState<Record<string, string>>({});
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState<Record<string, string>>({});
  const [content, setContent] = useState<Record<string, string>>({});
  const [imageUrl, setImageUrl] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [showEditor, setShowEditor] = useState(false);
  const [assetPickerOpen, setAssetPickerOpen] = useState(false);

  useEffect(() => {
    if (defaultValues) {
      setTitle((defaultValues.title as Record<string, string>) || {});
      setSlug((defaultValues.slug as string) || "");
      setExcerpt((defaultValues.excerpt as Record<string, string>) || {});
      setContent((defaultValues.content as Record<string, string>) || {});
      setImageUrl((defaultValues.imageUrl as string) || "");
      setIsPublished(defaultValues.isPublished !== undefined ? Boolean(defaultValues.isPublished) : false);
    }
  }, [defaultValues]);

  const setField = useCallback((field: string, locale: string, value: string) => {
    const setter: Record<string, React.Dispatch<React.SetStateAction<Record<string, string>>>> = {
      title: setTitle,
      excerpt: setExcerpt,
      content: setContent,
    };
    setter[field]?.((prev) => ({ ...prev, [locale]: value }));
  }, []);

  const getField = useCallback((field: string, locale: string): string => {
    const source: Record<string, Record<string, string>> = { title, excerpt, content };
    return source[field]?.[locale] || "";
  }, [title, excerpt, content]);

  function handleTitleChange(value: string) {
    setTitle((prev) => ({ ...prev, [currentLocale]: value }));
    if (!slugEdited.current) {
      setSlug(slugify(value));
    }
  }

  function handleSlugChange(value: string) {
    slugEdited.current = true;
    setSlug(value);
  }

  const activeLocales = showAllLocales ? [...locales] : [currentLocale];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!(title.vi || title.en)) newErrors.title = "Title is required";
    if (!slug.trim()) newErrors.slug = "Slug is required";
    else if (!/^[a-z0-9-]+$/.test(slug)) newErrors.slug = "Invalid slug format (lowercase, numbers, hyphens only)";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const data: Record<string, unknown> = {
      title,
      slug,
      excerpt,
      content,
      imageUrl,
      isPublished,
    };

    onSubmit(data);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Article Information</h3>
                <button
                  type="button"
                  onClick={() => setShowAllLocales(!showAllLocales)}
                  className="text-xs text-muted-foreground hover:text-foreground underline"
                >
                  {showAllLocales ? "Single language" : "All languages"}
                </button>
              </div>

              <div className="flex items-center gap-2 mb-2">
                {locales.map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setCurrentLocale(l)}
                    className={`px-2 py-0.5 text-xs rounded uppercase ${
                      currentLocale === l ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>

              {activeLocales.map((l) => (
                <div key={`title-${l}`} className="space-y-1">
                  {showAllLocales && <Label className="text-xs uppercase text-muted-foreground">Title ({l})</Label>}
                  <Input
                    value={getField("title", l)}
                    onChange={(e) => {
                      if (l === currentLocale) {
                        handleTitleChange(e.target.value);
                      } else {
                        setField("title", l, e.target.value);
                      }
                    }}
                    placeholder={`Article title${showAllLocales ? ` (${l})` : ""}`}
                  />
                </div>
              ))}
              {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}

              <div className="space-y-1">
                <Label htmlFor="slug">Slug</Label>
                <Input id="slug" value={slug} onChange={(e) => handleSlugChange(e.target.value)} placeholder="article-slug" />
                {errors.slug && <p className="text-xs text-destructive">{errors.slug}</p>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="text-sm font-medium">Short Description</h3>
              {activeLocales.map((l) => (
                <div key={`excerpt-${l}`} className="space-y-1">
                  {showAllLocales && <Label className="text-xs uppercase text-muted-foreground">{l}</Label>}
                  <textarea
                    value={getField("excerpt", l)}
                    onChange={(e) => setField("excerpt", l, e.target.value)}
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
              <h3 className="text-sm font-medium">Content</h3>
              <div className="min-h-[300px]">
                {activeLocales.map((l) => (
                  <div key={`content-${l}`} className={l !== currentLocale && !showAllLocales ? "hidden" : ""}>
                    {showAllLocales && <Label className="text-xs uppercase text-muted-foreground mb-1 block">{l}</Label>}
                    {showEditor && editorRef.current ? (
                      <CKEditor
                        key={`ck-${l}`}
                        editor={editorRef.current}
                        data={getField("content", l)}
                        onChange={(_event: any, editor: any) => {
                          setField("content", l, editor.getData());
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
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="text-sm font-medium">Thumbnail</h3>
              <p className="text-xs text-muted-foreground">Main article image shown in listings</p>
              {imageUrl ? (
                <div className="relative inline-block group">
                  <img src={imageUrl} alt="Thumbnail" className="h-40 w-40 rounded-md border object-cover" />
                  <button
                    type="button"
                    onClick={() => setImageUrl("")}
                    className="absolute top-1 right-1 rounded-full bg-background/80 p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:opacity-100"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </button>
                </div>
              ) : (
                <div className="h-40 w-40 rounded-md border border-dashed flex items-center justify-center text-muted-foreground">
                  <ImageIcon className="h-6 w-6" />
                </div>
              )}
              <div className="space-y-2">
                <ImageUploader
                  entityType="article"
                  entityId={articleId}
                  onUploadComplete={(img) => {
                    if (img?.url) setImageUrl(img.url);
                  }}
                />
                <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => setAssetPickerOpen(true)}>
                  <ImageIcon className="h-4 w-4" /> Browse Assets
                </Button>
                <AssetPicker
                  open={assetPickerOpen}
                  onOpenChange={setAssetPickerOpen}
                  onSelect={(url) => {
                    setImageUrl(url);
                    setAssetPickerOpen(false);
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-2">
                <Switch id="isPublished" checked={isPublished} onCheckedChange={setIsPublished} />
                <Label htmlFor="isPublished">Published</Label>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {defaultValues ? "Update Article" : "Create Article"}
        </Button>
        <Button variant="outline" asChild><Link href="/articles">Cancel</Link></Button>
      </div>
    </form>
  );
}
