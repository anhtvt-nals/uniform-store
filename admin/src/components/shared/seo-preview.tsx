import type { SeoAnalysis } from "@/lib/seo/analyzer";

export function SeoScore({ analysis }: { analysis: SeoAnalysis }) {
  return (
    <div className="space-y-2 rounded-md border border-dashed border-border p-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">Điểm SEO</span>
        <span className="font-semibold">{analysis.score}/100</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${analysis.score}%` }}
        />
      </div>
      <ul className="space-y-1 text-xs text-muted-foreground">
        {analysis.checks.map((check) => (
          <li key={check.key} className={check.passed ? "text-emerald-600" : "text-amber-600"}>
            {check.passed ? "✓" : "•"} {check.passed ? check.label : check.message}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SeoPreview({
  title,
  description,
  socialTitle,
  socialDescription,
  url,
  imageUrl,
}: {
  title: string;
  description: string;
  socialTitle?: string;
  socialDescription?: string;
  url: string;
  imageUrl?: string;
}) {
  return (
    <div className="space-y-3 rounded-md border border-border p-3">
      <p className="text-xs font-medium text-muted-foreground">Xem trước kết quả tìm kiếm</p>
      <div className="space-y-1">
        <p className="truncate text-sm text-emerald-700">{url || "https://minhanuniform.com/..."}</p>
        <p className="line-clamp-2 text-base text-blue-700">{title || "Tiêu đề trang"}</p>
        <p className="line-clamp-2 text-xs text-muted-foreground">
          {description || "Mô tả trang sẽ hiển thị ở đây."}
        </p>
      </div>
      <div className="flex gap-3 rounded-md bg-muted p-2">
        {imageUrl ? <img src={imageUrl} alt="" className="h-14 w-14 rounded object-cover" /> : null}
        <div className="min-w-0">
          <p className="text-xs font-medium">Xem trước chia sẻ mạng xã hội</p>
          <p className="truncate text-xs text-muted-foreground">{socialTitle || title || "Tiêu đề trang"}</p>
          <p className="truncate text-xs text-muted-foreground">{socialDescription || description || "Mô tả trang sẽ hiển thị ở đây."}</p>
        </div>
      </div>
    </div>
  );
}
