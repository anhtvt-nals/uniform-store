import { getRouteLocale } from "@/i18n/server";
import { getTopCollections } from "@/lib/vendure/cached";
import { NavProductsClient } from "./nav-products-client";

export async function NavProducts() {
  const locale = await getRouteLocale();
  let collections: { id: string; name: string; slug: string }[] = [];
  try {
    collections = await getTopCollections(locale);
  } catch {
    // Keep the main product link available while the catalog API is unavailable.
  }

  return <NavProductsClient collections={collections} />;
}
