import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
import ts from "typescript";

const require = createRequire(import.meta.url);
const sourcePath = path.resolve("storefront/src/lib/metadata.ts");
const source = fs.readFileSync(sourcePath, "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const module = { exports: {} };
vm.runInNewContext(`(function (require, module, exports) { ${compiled}\n })(require, module, module.exports);`, {
  require,
  module,
  exports: module.exports,
  process,
});

const { buildArticleJsonLd, buildBreadcrumbJsonLd, serializeJsonLd } = module.exports;
const article = buildArticleJsonLd({
  title: "Bài viết </script>",
  description: "Mô tả",
  url: "https://minhanuniform.com/vi/news/bai-viet",
  publishedAt: "2026-09-20T00:00:00.000Z",
  imageUrl: "https://cdn.example/image.jpg",
});
assert.equal(article["@type"], "Article");
assert.ok(!serializeJsonLd(article).includes("</script>"));
assert.equal(JSON.stringify(buildBreadcrumbJsonLd([
  { name: "Trang chủ", url: "https://minhanuniform.com/vi" },
  { name: "Bài viết", url: "https://minhanuniform.com/vi/news" },
])), JSON.stringify({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
  { "@type": "ListItem", position: 1, name: "Trang chủ", item: "https://minhanuniform.com/vi" },
  { "@type": "ListItem", position: 2, name: "Bài viết", item: "https://minhanuniform.com/vi/news" },
] }));
console.log("metadata checks passed");
