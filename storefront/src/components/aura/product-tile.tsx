"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { FragmentOf, readFragment } from "@/graphql";
import { ProductCardFragment } from "@/lib/vendure/fragments";
import { Price } from "@/components/commerce/price";

export function ProductTile({
  product: productProp,
  index,
  compact = false,
}: {
  product: FragmentOf<typeof ProductCardFragment>;
  index: number;
  compact?: boolean;
  // Kept for existing callers while product quick-view is intentionally disabled.
  quickView?: boolean;
}) {
  const t = useTranslations("Product");
  const product = readFragment(ProductCardFragment, productProp);
  const imageUrl = product.productAsset?.preview;
  const price = product.priceWithTax;
  const isContactPrice =
    (product as typeof product & { isContactPrice?: boolean })
      .isContactPrice === true;
  const soldCount = Number(
    (product as typeof product & { soldCount?: number }).soldCount ?? 0,
  );

  let priceNode: React.ReactNode = null;
  if (price.__typename === "PriceRange") {
    priceNode =
      price.min !== price.max ? (
        <>
          <span className="mr-1 text-xs font-normal text-muted-foreground">
            {t("from")}
          </span>
          <Price value={price.min} currencyCode={product.currencyCode} />
        </>
      ) : (
        <Price value={price.min} currencyCode={product.currencyCode} />
      );
  } else if (price.__typename === "SinglePrice") {
    priceNode = (
      <Price value={price.value} currencyCode={product.currencyCode} />
    );
  }

  return (
    <Link
      href={`/product/${product.slug}`}
      className={`group relative flex flex-col border border-border bg-background shadow-sm transition-shadow hover:shadow-md ${compact ? "h-auto self-start rounded-2xl p-2" : "h-full rounded-[24px] p-3"}`}
    >
      <div className="absolute left-5 top-5 z-20">
        {index === 0 && (
          <span className="rounded-full bg-red-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-sm">
            {t("bestSeller")}
          </span>
        )}
        {index === 1 && (
          <span className="rounded-full bg-blue-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-sm">
            {t("new")}
          </span>
        )}
      </div>

      <div
        className={`relative overflow-hidden bg-muted ${compact ? "mb-3 aspect-[16/15] rounded-xl" : "mb-4 aspect-[4/5] flex-1 rounded-[16px]"}`}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.productName}
            className="size-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
            {t("noImage")}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5 px-1">
        <h4 className="truncate text-sm font-bold text-foreground">
          {product.productName}
        </h4>
        <div className="flex items-end justify-between">
          <div className="text-xs font-bold text-primary">
            {isContactPrice ? "Giá liên hệ" : priceNode}
          </div>
          <div className="text-[10px] font-medium text-muted-foreground">
            {t("sold", { count: soldCount })}
          </div>
        </div>
      </div>
    </Link>
  );
}
