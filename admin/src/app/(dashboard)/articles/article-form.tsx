"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { getToken } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageUploader } from "@/components/shared/image-uploader";
import { AssetPicker } from "@/components/shared/asset-picker";
import { Loader2, ImageIcon, Trash2 } from "lucide-react";

const CKEditor = dynamic(
  () => import("@ckeditor/ckeditor5-react").then((mod) => mod.CKEditor),
  { ssr: false, loading: () => <Skeleton className="h-72 w-full" /> },
);

type ArticleTag = { id: string; name: Record<string, string> };

type ArticleFormProps = {
  defaultValues?: Record<string, unknown>;
  onSubmit: (data: Record<string, unknown>) => void;
  isSubmitting: boolean;
  articleId?: string;
  onCancel?: () => void;
  embedded?: boolean;
};

function MyCustomUploadAdapterPlugin(editor: any) {
  editor.plugins.get("FileRepository").createUploadAdapter = (loader: any) => ({
    upload: async () => {
      const file = await loader.file;
      const formData = new FormData();
      formData.append("file", file);
      const token = getToken();
      const baseUrl =
        process.env.NEXT_PUBLIC_ADMIN_API_URL ||
        "http://localhost:3002/api/v1/admin";
      const res = await fetch(`${baseUrl}/uploads/upload`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      const json = await res.json();
      if (!json.success)
        throw new Error(json.error?.message || "Không thể tải ảnh lên");
      return { default: json.data.url };
    },
  });
}

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function ArticleForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  articleId,
  onCancel,
  embedded = false,
}: ArticleFormProps) {
  const slugEdited = useRef(false);
  const editorRef = useRef<any>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [assetPickerOpen, setAssetPickerOpen] = useState(false);

  useEffect(() => {
    import("@ckeditor/ckeditor5-build-classic").then((mod) => {
      editorRef.current = mod.default;
      setShowEditor(true);
    });
  }, []);

  useEffect(() => {
    const source = defaultValues ?? {};
    const titleValues = source.title as Record<string, string> | undefined;
    const excerptValues = source.excerpt as Record<string, string> | undefined;
    const contentValues = source.content as Record<string, string> | undefined;
    const articleTags = (source.tags as ArticleTag[] | undefined) ?? [];
    setTitle(titleValues?.vi ?? "");
    setSlug((source.slug as string) ?? "");
    setExcerpt(excerptValues?.vi ?? "");
    setContent(contentValues?.vi ?? "");
    setTags(
      articleTags
        .map((tag) => tag.name.vi)
        .filter(Boolean)
        .join(", "),
    );
    setImageUrl((source.imageUrl as string) ?? "");
    setIsPublished(Boolean(source.isPublished));
    slugEdited.current = Boolean(source.slug);
  }, [defaultValues]);

  const setEditorContent = useCallback(
    (value: string) => setContent(value),
    [],
  );

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugEdited.current) setSlug(slugify(value));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!title.trim()) nextErrors.title = "Vui lòng nhập tiêu đề bài viết";
    if (!slug.trim()) nextErrors.slug = "Vui lòng nhập đường dẫn";
    else if (!/^[a-z0-9-]+$/.test(slug))
      nextErrors.slug = "Đường dẫn chỉ gồm chữ thường, số và dấu gạch ngang";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    onSubmit({
      title: { vi: title.trim() },
      slug,
      excerpt: { vi: excerpt.trim() },
      content: { vi: content },
      tagNames: [
        ...new Set(
          tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
        ),
      ],
      imageUrl,
      isPublished,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={embedded ? "flex min-h-0 flex-1 flex-col" : "space-y-6"}
    >
      <div
        className={
          embedded
            ? "min-h-0 flex-1 space-y-4 overflow-y-auto pr-1"
            : "space-y-6"
        }
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <Card>
              <CardContent className="space-y-4 pt-6">
                <h3 className="text-sm font-medium">Thông tin bài viết</h3>
                <div className="space-y-1">
                  <Label htmlFor="article-title">Tiêu đề</Label>
                  <Input
                    id="article-title"
                    value={title}
                    onChange={(event) => handleTitleChange(event.target.value)}
                    placeholder="Tiêu đề bài viết"
                  />
                  {errors.title && (
                    <p className="text-xs text-destructive">{errors.title}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="article-slug">Đường dẫn (slug)</Label>
                  <Input
                    id="article-slug"
                    value={slug}
                    onChange={(event) => {
                      slugEdited.current = true;
                      setSlug(slugify(event.target.value));
                    }}
                    placeholder="tieu-de-bai-viet"
                  />
                  {errors.slug && (
                    <p className="text-xs text-destructive">{errors.slug}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="article-tags">Thẻ</Label>
                  <Input
                    id="article-tags"
                    value={tags}
                    onChange={(event) => setTags(event.target.value)}
                    placeholder="Đồng phục, thiết kế, doanh nghiệp"
                  />
                  <p className="text-xs text-muted-foreground">
                    Nhập các thẻ, cách nhau bằng dấu phẩy.
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="space-y-2 pt-6">
                <h3 className="text-sm font-medium">Mô tả ngắn</h3>
                <textarea
                  value={excerpt}
                  onChange={(event) => setExcerpt(event.target.value)}
                  placeholder="Tóm tắt bài viết"
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="space-y-3 pt-6">
                <h3 className="text-sm font-medium">Nội dung bài viết</h3>
                <div className="min-h-[300px]">
                  {showEditor && editorRef.current ? (
                    <CKEditor
                      editor={editorRef.current}
                      data={content}
                      onChange={(
                        _event: unknown,
                        editor: { getData: () => string },
                      ) => setEditorContent(editor.getData())}
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
              </CardContent>
            </Card>
          </div>
          <div className="space-y-4">
            <Card>
              <CardContent className="space-y-4 pt-6">
                <h3 className="text-sm font-medium">Ảnh thumbnail</h3>
                <p className="text-xs text-muted-foreground">
                  Ảnh đại diện hiển thị trên danh sách bài viết.
                </p>
                {imageUrl ? (
                  <div className="group relative inline-block">
                    <img
                      src={imageUrl}
                      alt="Ảnh đại diện bài viết"
                      className="h-40 w-40 rounded-md border object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setImageUrl("")}
                      className="absolute right-1 top-1 rounded-full bg-background/80 p-1 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </button>
                  </div>
                ) : (
                  <div className="flex h-40 w-40 items-center justify-center rounded-md border border-dashed text-muted-foreground">
                    <ImageIcon className="h-6 w-6" />
                  </div>
                )}
                <ImageUploader
                  entityType="article"
                  entityId={articleId}
                  onUploadComplete={(image) => {
                    if (image?.url) setImageUrl(image.url);
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setAssetPickerOpen(true)}
                >
                  <ImageIcon className="h-4 w-4" />
                  Chọn từ assets
                </Button>
                <AssetPicker
                  open={assetPickerOpen}
                  onOpenChange={setAssetPickerOpen}
                  onSelect={(url) => {
                    setImageUrl(url);
                    setAssetPickerOpen(false);
                  }}
                />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Switch
                    id="article-published"
                    checked={isPublished}
                    onCheckedChange={setIsPublished}
                  />
                  <Label htmlFor="article-published">Xuất bản bài viết</Label>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <div
        className={
          embedded
            ? "mt-4 flex shrink-0 justify-end gap-2 border-t pt-4"
            : "flex items-center gap-2"
        }
      >
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {defaultValues ? "Lưu thay đổi" : "Tạo bài viết"}
        </Button>
      </div>
    </form>
  );
}
