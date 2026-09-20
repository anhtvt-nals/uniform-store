import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/metadata";

export default function robots(): MetadataRoute.Robots {
  const privatePaths = ["account", "cart", "checkout", "search", "tra-cuu-don-hang"];
  const disallow = privatePaths.map((path) => `/${path}`);

  return {
    rules: { userAgent: "*", allow: "/", disallow },
    sitemap: `${SITE_URL.replace(/\/$/, "")}/sitemap.xml`,
  };
}
