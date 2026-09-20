import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
import ts from "typescript";

const require = createRequire(import.meta.url);

const sourcePath = path.resolve("admin/src/lib/seo/analyzer.ts");
assert.ok(fs.existsSync(sourcePath), "analyzer.ts must exist");

const source = fs.readFileSync(sourcePath, "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const module = { exports: {} };
vm.runInNewContext(`(function (require, module, exports) { ${compiled}\n })(require, module, module.exports);`, {
  require,
  module,
  exports: module.exports,
});

const { analyzeSeo } = module.exports;
assert.equal(typeof analyzeSeo, "function");

const result = analyzeSeo({
  title: "Áo đồng phục doanh nghiệp cao cấp Minh An Uniform",
  description: "Đồng phục doanh nghiệp chất lượng cao, thiết kế theo yêu cầu và giao hàng toàn quốc cho doanh nghiệp.",
  focusKeyword: "đồng phục doanh nghiệp",
  slug: "ao-dong-phuc-doanh-nghiep",
  content: "<p>Chọn đồng phục doanh nghiệp phù hợp giúp đội ngũ chuyên nghiệp hơn.</p>",
});

assert.equal(result.plainText, "Chọn đồng phục doanh nghiệp phù hợp giúp đội ngũ chuyên nghiệp hơn.");
assert.ok(result.score >= 0 && result.score <= 100);
assert.ok(result.checks.some((check) => check.key === "keywordInContent" && check.passed));

const missingKeyword = analyzeSeo({ title: "Tiêu đề", description: "Mô tả", focusKeyword: "", slug: "tieu-de", content: "" });
assert.ok(missingKeyword.checks.some((check) => check.key === "focusKeyword" && !check.passed));

const richTextKeyword = analyzeSeo({
  title: "Tiêu đề đồng phục doanh nghiệp chất lượng cao",
  description: "Mô tả đồng phục doanh nghiệp chất lượng cao dành cho các công ty hiện đại và chuyên nghiệp.",
  focusKeyword: "đồng phục",
  slug: "dong-phuc",
  content: "<p>đồng&nbsp;phục</p><p>đồ<strong>ng</strong> phục</p>",
});
assert.ok(richTextKeyword.checks.some((check) => check.key === "keywordInContent" && check.passed));
const inlineKeyword = analyzeSeo({ title: "Tiêu đề", description: "Mô tả", focusKeyword: "đồng phục", slug: "x", content: "<p>đồ<strong>ng</strong> phục</p>" });
assert.ok(inlineKeyword.checks.some((check) => check.key === "keywordInContent" && check.passed));

const boundaryChecks = analyzeSeo({ title: "ngắn", description: "ngắn", focusKeyword: "từ khóa", slug: "", content: "" });
assert.ok(boundaryChecks.checks.some((check) => check.key === "titleLength" && !check.passed));
assert.ok(boundaryChecks.checks.some((check) => check.key === "descriptionLength" && !check.passed));
assert.ok(boundaryChecks.checks.some((check) => check.key === "keywordInTitle" && !check.passed));

console.log("seo analyzer checks passed");
