"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { SearchCheck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiClient, getToken } from "@/lib/api";
import { summarizeSeo, type SeoDashboardRecord } from "@/lib/seo/dashboard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select as SelectNative } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/shared/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Localized = Record<string, string> | null | undefined;
type ListResponse<T> = { items: T[] };
type Article = { id: string; title: Localized; slug: string; excerpt?: Localized; content?: Localized; metaTitle?: Localized; metaDesc?: Localized; focusKeyword?: Localized };
type Product = { id: string; name: Localized; slug: string; description?: Localized; detail?: Localized; metaTitle?: Localized; metaDesc?: Localized; focusKeyword?: Localized };

const text = (value: Localized) => value?.vi || value?.en || Object.values(value || {})[0] || "";

export default function SeoDashboardPage() {
  const token = getToken();
  const [threshold, setThreshold] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const { data, isLoading, isError } = useQuery({
    queryKey: ["seo-dashboard"],
    queryFn: async () => {
      const [articles, products] = await Promise.all([
        apiClient<ListResponse<Article>>("/articles", { params: { page: 1, limit: 1000 }, token }),
        apiClient<ListResponse<Product>>("/products", { params: { page: 1, limit: 1000, includeDeleted: false }, token }),
      ]);
      const records: SeoDashboardRecord[] = [
        ...articles.data.items.map((item) => ({
          id: item.id, type: "article" as const, title: text(item.title), slug: item.slug,
          description: text(item.metaDesc) || text(item.excerpt), content: text(item.content),
          metaTitle: text(item.metaTitle), metaDesc: text(item.metaDesc), focusKeyword: text(item.focusKeyword),
        })),
        ...products.data.items.map((item) => ({
          id: item.id, type: "product" as const, title: text(item.name), slug: item.slug,
          description: text(item.metaDesc) || text(item.description), content: text(item.detail) || text(item.description),
          metaTitle: text(item.metaTitle), metaDesc: text(item.metaDesc), focusKeyword: text(item.focusKeyword),
        })),
      ];
      return summarizeSeo(records);
    },
  });

  const filteredItems = useMemo(() => {
    if (!data) return [];
    return data.items.filter((item) => threshold === "all" || (threshold === "low" ? item.analysis.score < 50 : threshold === "medium" ? item.analysis.score < 80 : item.analysis.score >= 80));
  }, [data, threshold]);
  const pageItems = filteredItems.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filteredItems.length / pageSize);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight"><SearchCheck className="h-6 w-6" /> SEO</h1>
        <p className="text-sm text-muted-foreground">Tổng hợp tình trạng tối ưu SEO của bài viết và sản phẩm.</p>
      </div>
      {isLoading ? <div className="grid gap-4 md:grid-cols-3"><Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" /></div> : isError || !data ? <Card><CardContent className="p-6 text-sm text-destructive">Không thể tải dữ liệu SEO.</CardContent></Card> : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Tổng nội dung</CardTitle></CardHeader><CardContent className="text-3xl font-bold">{data.total}</CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Đã đủ trường SEO</CardTitle></CardHeader><CardContent className="text-3xl font-bold">{data.optimized}<span className="ml-2 text-sm font-normal text-muted-foreground">/ {data.total}</span></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Điểm SEO trung bình</CardTitle></CardHeader><CardContent className="text-3xl font-bold">{data.averageScore}<span className="ml-1 text-sm font-normal text-muted-foreground">/100</span></CardContent></Card>
          </div>
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0"><CardTitle>Nội dung cần cải thiện</CardTitle><SelectNative className="w-44" value={threshold} onChange={(event) => { setThreshold(event.target.value); setPage(1); }} options={[{ value: "all", label: "Tất cả điểm" }, { value: "low", label: "Dưới 50" }, { value: "medium", label: "50–79" }, { value: "high", label: "Từ 80" }]} /></CardHeader>
            <CardContent className="p-0"><Table><TableHeader><TableRow><TableHead>Nội dung</TableHead><TableHead>Loại</TableHead><TableHead>Điểm</TableHead><TableHead>Thiếu</TableHead><TableHead /></TableRow></TableHeader><TableBody>{pageItems.map((item) => { const missing = [!item.metaTitle && "meta title", !item.metaDesc && "meta description", !item.focusKeyword && "focus keyword"].filter(Boolean); return <TableRow key={`${item.type}-${item.id}`}><TableCell className="font-medium">{item.title || item.slug}</TableCell><TableCell>{item.type === "article" ? "Bài viết" : "Sản phẩm"}</TableCell><TableCell><Badge variant={item.analysis.score >= 80 ? "success" : item.analysis.score >= 50 ? "warning" : "destructive"}>{item.analysis.score}</Badge></TableCell><TableCell className="text-xs text-muted-foreground">{missing.length ? missing.join(", ") : "Đủ trường"}</TableCell><TableCell><Link className="text-sm text-primary hover:underline" href={`/${item.type === "article" ? "articles" : "products"}/${item.id}`}>Mở</Link></TableCell></TableRow>; })}</TableBody></Table>{!filteredItems.length ? <p className="p-6 text-sm text-muted-foreground">Không có nội dung phù hợp.</p> : <div className="px-6 pb-6"><Pagination page={page} totalPages={totalPages} totalItems={filteredItems.length} onPageChange={setPage} /></div>}</CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
