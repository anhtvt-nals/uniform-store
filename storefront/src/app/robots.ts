import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/metadata";

export default function robots(): MetadataRoute.Robots {
  const privatePaths = ["account", "cart", "checkout", "search", "tra-cuu-don-hang"];
  const disallow = routing.locales.flatMap((locale) =>
    privatePaths.map((path) => `/${locale}/${path}`),
  );

  return {
    rules: { userAgent: "*", allow: "/", disallow },
    sitemap: `${SITE_URL.replace(/\/$/, "")}/sitemap.xml`,
  };
}
