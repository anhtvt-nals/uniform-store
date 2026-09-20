import { analyzeSeo, type SeoAnalysis } from "./analyzer";

export type SeoDashboardRecord = {
  id: string;
  type: "article" | "product";
  title: string;
  slug: string;
  description: string;
  content: string;
  metaTitle?: string;
  metaDesc?: string;
  focusKeyword?: string;
};

export type SeoDashboardItem = SeoDashboardRecord & { analysis: SeoAnalysis };

export function summarizeSeo(records: SeoDashboardRecord[]) {
  const items = records.map((record) => ({
    ...record,
    analysis: analyzeSeo({
      title: record.metaTitle || record.title,
      description: record.metaDesc || record.description,
      focusKeyword: record.focusKeyword || "",
      slug: record.slug,
      content: record.content,
    }),
  }));
  const optimized = items.filter((item) => item.metaTitle && item.metaDesc && item.focusKeyword).length;
  return {
    items,
    total: items.length,
    optimized,
    averageScore: items.length ? Math.round(items.reduce((sum, item) => sum + item.analysis.score, 0) / items.length) : 0,
  };
}
