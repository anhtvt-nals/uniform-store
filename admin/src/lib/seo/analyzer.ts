export type SeoAnalyzerInput = {
  title: string;
  description: string;
  focusKeyword: string;
  slug: string;
  content: string;
};

export type SeoCheck = {
  key: string;
  label: string;
  passed: boolean;
  message: string;
};

export type SeoAnalysis = {
  score: number;
  checks: SeoCheck[];
  plainText: string;
};

function normalize(value: string) {
  return value.normalize("NFC").toLocaleLowerCase().replace(/\s+/g, " ").trim();
}

function stripHtml(value: string) {
  return value
    .replace(/<(?:address|article|aside|blockquote|br|div|dl|fieldset|footer|form|h[1-6]|header|hr|li|main|nav|ol|p|pre|section|table|tr|ul)[^>]*>/gi, " ")
    .replace(/<\/[^>]+>/g, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim()
    .normalize("NFC");
}

function within(value: string, min: number, max: number) {
  return value.length >= min && value.length <= max;
}

export function analyzeSeo(input: SeoAnalyzerInput): SeoAnalysis {
  const title = input.title.trim();
  const description = input.description.trim();
  const keyword = normalize(input.focusKeyword);
  const normalizedTitle = normalize(title);
  const normalizedDescription = normalize(description);
  const plainText = stripHtml(input.content);
  const normalizedContent = normalize(plainText);

  const checks: SeoCheck[] = [
    {
      key: "titleLength",
      label: "Độ dài tiêu đề",
      passed: within(title, 30, 60),
      message: "Tiêu đề nên dài từ 30–60 ký tự.",
    },
    {
      key: "descriptionLength",
      label: "Độ dài mô tả",
      passed: within(description, 120, 160),
      message: "Mô tả nên dài từ 120–160 ký tự.",
    },
    {
      key: "focusKeyword",
      label: "Từ khóa chính",
      passed: Boolean(keyword),
      message: "Nên nhập một từ khóa chính.",
    },
    {
      key: "keywordInTitle",
      label: "Từ khóa trong tiêu đề",
      passed: Boolean(keyword && normalizedTitle.includes(keyword)),
      message: "Nên đưa từ khóa chính vào tiêu đề.",
    },
    {
      key: "keywordInDescription",
      label: "Từ khóa trong mô tả",
      passed: Boolean(keyword && normalizedDescription.includes(keyword)),
      message: "Nên đưa từ khóa chính vào mô tả.",
    },
    {
      key: "keywordInContent",
      label: "Từ khóa trong nội dung",
      passed: Boolean(keyword && normalizedContent.includes(keyword)),
      message: "Nên đưa từ khóa chính vào nội dung.",
    },
    {
      key: "slug",
      label: "Đường dẫn thân thiện",
      passed: Boolean(input.slug.trim()),
      message: "Nên có đường dẫn (slug) cho nội dung.",
    },
  ];

  const passed = checks.filter((check) => check.passed).length;
  return {
    score: Math.max(0, Math.min(100, Math.round((passed / checks.length) * 100))),
    checks,
    plainText,
  };
}
