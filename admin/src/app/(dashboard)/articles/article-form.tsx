"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { getToken } from "@/lib/api";
import { uploadImage } from '@/lib/image-upload';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageUploader } from "@/components/shared/image-uploader";
import { AssetPicker, type Asset } from "@/components/shared/asset-picker";
import { SeoPreview, SeoScore } from "@/components/shared/seo-preview";
import { analyzeSeo } from "@/lib/seo/analyzer";
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
      const token = getToken();
      const image = await uploadImage(file, token);
      return { default: image.url };
    },
  });
}

function snapshotAsset(asset: Asset) {
  const escape = (value: string) => value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]!);
  const alt = asset.alt?.vi ?? "";
  const title = asset.title?.vi ?? "";
  const caption = asset.caption?.vi ?? "";
  const image = `<img src="${escape(asset.url)}" alt="${escape(alt)}"${title ? ` title="${escape(title)}"` : ""}>`;
  const figure = caption ? `<figure>${image}<figcaption>${escape(caption)}</figcaption></figure>` : image;
  const link = asset.linkUrl?.trim() ?? "";
  return /^(javascript|data):/i.test(link) ? figure : link ? `<a href="${escape(link)}">${figure}</a>` : figure;
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
  const contentEditorRef = useRef<any>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDesc, setMetaDesc] = useState("");
  const [focusKeyword, setFocusKeyword] = useState("");
  const [ogTitle, setOgTitle] = useState("");
  const [ogDescription, setOgDescription] = useState("");
  const [ogImageUrl, setOgImageUrl] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [assetPickerOpen, setAssetPickerOpen] = useState(false);
  const [contentAssetPickerOpen, setContentAssetPickerOpen] = useState(false);

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
    setMetaTitle((source.metaTitle as Record<string, string> | undefined)?.vi ?? "");
    setMetaDesc((source.metaDesc as Record<string, string> | undefined)?.vi ?? "");
    setFocusKeyword((source.focusKeyword as Record<string, string> | undefined)?.vi ?? "");
    setOgTitle((source.ogTitle as Record<string, string> | undefined)?.vi ?? "");
    setOgDescription((source.ogDescription as Record<string, string> | undefined)?.vi ?? "");
    setOgImageUrl((source.ogImageUrl as Record<string, string> | undefined)?.vi ?? "");
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
      ...(metaTitle && { metaTitle: { vi: metaTitle } }),
      ...(metaDesc && { metaDesc: { vi: metaDesc } }),
      ...(focusKeyword && { focusKeyword: { vi: focusKeyword } }),
      ...(ogTitle && { ogTitle: { vi: ogTitle } }),
      ...(ogDescription && { ogDescription: { vi: ogDescription } }),
      ...(ogImageUrl && { ogImageUrl: { vi: ogImageUrl } }),
    });
  }

  const seoAnalysis = analyzeSeo({
    title: metaTitle || title,
    description: metaDesc || excerpt,
    focusKeyword,
    slug,
    content,
  });

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
              <CardContent className="space-y-3 pt-6">
                <h3 className="text-sm font-medium">SEO (không bắt buộc)</h3>
                <Input value={metaTitle} onChange={(event) => setMetaTitle(event.target.value)} placeholder="Tiêu đề SEO" />
                <Input value={metaDesc} onChange={(event) => setMetaDesc(event.target.value)} placeholder="Mô tả SEO" />
                <Input value={focusKeyword} onChange={(event) => setFocusKeyword(event.target.value)} placeholder="Từ khóa chính" />
                <Input value={ogTitle} onChange={(event) => setOgTitle(event.target.value)} placeholder="Tiêu đề Open Graph" />
                <Input value={ogDescription} onChange={(event) => setOgDescription(event.target.value)} placeholder="Mô tả Open Graph" />
                <Input value={ogImageUrl} onChange={(event) => setOgImageUrl(event.target.value)} placeholder="URL ảnh Open Graph" />
                <SeoScore analysis={seoAnalysis} />
                <SeoPreview
                  title={metaTitle || title}
                  description={metaDesc || excerpt}
                  socialTitle={ogTitle}
                  socialDescription={ogDescription}
                  url={slug ? `/vi/tin-tuc/${slug}` : ""}
                  imageUrl={ogImageUrl || imageUrl}
                />
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
                      onReady={(editor: any) => { contentEditorRef.current = editor; }}
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
                            "toggleImageCaption",
                            "imageTextAlternative",
                            "imageStyle:inline",
                            "imageStyle:block",
                            "imageStyle:side",
                          ],
                        },
                        link: {
                          decorators: {
                            openInNewTab: {
                              mode: "manual",
                              label: "Mở liên kết trong tab mới",
                              attributes: { target: "_blank", rel: "noopener noreferrer" },
                            },
                          },
                        },
                        extraPlugins: [MyCustomUploadAdapterPlugin],
                      }}
                    />
                  ) : (
                    <Skeleton className="h-72 w-full" />
                  )}
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => setContentAssetPickerOpen(true)}>
                  <ImageIcon className="h-4 w-4" /> Chèn từ tài nguyên
                </Button>
                <AssetPicker
                  open={contentAssetPickerOpen}
                  onOpenChange={setContentAssetPickerOpen}
                  onSelect={(asset) => {
                    const editor = contentEditorRef.current;
                    if (editor) editor.model.change(() => editor.model.insertContent(editor.data.toModel(editor.data.processor.toView(snapshotAsset(asset))), editor.model.document.selection));
                    setContentAssetPickerOpen(false);
                  }}
                />
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
                  onSelect={(asset) => {
                    setImageUrl(asset.url);
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
