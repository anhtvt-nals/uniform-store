import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync("storefront/src/app/sitemap.ts", "utf8");
assert.ok(source.includes("SearchProductsQuery"), "sitemap must use the supported SearchProducts operation");
assert.ok(!source.includes("GetSitemapProductsQuery"), "sitemap must not use an unsupported operation");
assert.ok(source.includes("GetTopCollectionsQuery"), "sitemap must include collections");
assert.ok(source.includes("{ skip, take: PAGE_SIZE"), "sitemap must paginate products");
assert.ok(!source.includes("/${locale}"), "localePrefix=never sitemap URLs must be unprefixed");

const robots = fs.readFileSync("storefront/src/app/robots.ts", "utf8");
assert.ok(robots.includes('privatePaths.map((path) => `/${path}`)'), "robots must block unprefixed routes");

console.log("sitemap checks passed");
