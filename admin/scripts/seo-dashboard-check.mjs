import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";

function load(file, dependencies = {}) {
  const source = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(`(function (require, module, exports) { ${source}\n })(require, module, module.exports);`, {
    require: (name) => dependencies[name] || require(name), module, exports: module.exports,
  });
  return module.exports;
}

const analyzer = load(path.resolve("admin/src/lib/seo/analyzer.ts"));
const { summarizeSeo } = load(path.resolve("admin/src/lib/seo/dashboard.ts"), { "./analyzer": analyzer });
const result = summarizeSeo([
  { id: "a", type: "article", title: "Bài viết đủ dữ liệu SEO dài vừa phải", slug: "bai-viet", description: "Mô tả bài viết đủ dài", content: "Nội dung", metaTitle: "Tiêu đề SEO", metaDesc: "Mô tả SEO", focusKeyword: "bài viết" },
  { id: "p", type: "product", title: "Áo đồng phục", slug: "ao-dong-phuc", description: "", content: "", metaTitle: "", metaDesc: "", focusKeyword: "" },
]);
assert.equal(result.total, 2);
assert.equal(result.optimized, 1);
assert.equal(result.items.length, 2);
assert.ok(result.averageScore >= 0 && result.averageScore <= 100);
assert.equal(result.items.filter((item) => !item.focusKeyword).length, 1);
console.log("seo dashboard checks passed");
