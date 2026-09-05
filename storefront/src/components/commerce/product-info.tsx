"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Price } from "@/components/commerce/price";
import { QuoteButton } from "@/components/commerce/quote-button";

interface ProductInfoProps {
  product: {
    slug: string;
    name: string;
    detail?: string | null;
  };
  currencyCode: string;
}

type ProductPricing = {
  basePrice: number;
  isContactPrice: boolean;
  sizes: Array<{ id: string; code: string; weightRange: string }>;
  sizeGuideImageUrl: string;
};

export function ProductInfo({ product, currencyCode }: ProductInfoProps) {
  const [pricing, setPricing] = useState<ProductPricing | null>(null);
  const [zaloUrl, setZaloUrl] = useState("https://zalo.me/0901234567");
  const [selectedSizeId, setSelectedSizeId] = useState<string | null>(null);

  useEffect(() => {
    setPricing(null);
    setSelectedSizeId(null);
    fetch(`/api/v1/products/${product.slug}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        const data = payload?.data || payload;
        if (!data) return;
        setPricing({
          basePrice: Number(data.basePrice || 0),
          isContactPrice: Boolean(data.isContactPrice),
          sizes: data.sizes || [],
          sizeGuideImageUrl: data.sizeGuideImageUrl || "",
        });
      })
      .catch(() => undefined);
  }, [product.slug]);

  useEffect(() => {
    fetch("/api/v1/settings/public")
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        const settings = payload?.data || payload;
        if (
          typeof settings?.zalo_url === "string" &&
          settings.zalo_url.trim()
        ) {
          setZaloUrl(settings.zalo_url);
        }
      })
      .catch(() => undefined);
  }, []);

  const selectedSize = useMemo(
    () => pricing?.sizes.find((size) => size.id === selectedSizeId) ?? null,
    [pricing?.sizes, selectedSizeId],
  );
  const quoteProductType = `${product.name}${selectedSize ? `\nSize: ${selectedSize.code}` : ""}`;

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h1 className="font-category-title text-2xl tracking-tight md:text-3xl">
          {product.name}
        </h1>
        {pricing ? (
          <p className="inline-flex items-center gap-2 text-primary">
            {pricing.isContactPrice ? (
              <span className="text-xl font-extrabold tracking-tight md:text-2xl">Giá liên hệ</span>
            ) : (
              <>
                <span className="whitespace-nowrap text-sm font-bold text-foreground md:text-base">Chỉ từ</span>
                <span className="text-xl font-extrabold tracking-tight md:text-2xl">
                  <Price value={pricing.basePrice} currencyCode={currencyCode} />
                </span>
              </>
            )}
          </p>
        ) : (
          <div className="h-8 w-28 animate-pulse rounded bg-muted" />
        )}
        {product.detail ? (
          <div
            className="prose prose-sm max-w-none leading-relaxed text-muted-foreground prose-headings:text-foreground prose-a:text-primary"
            dangerouslySetInnerHTML={{ __html: product.detail }}
          />
        ) : null}
      </div>

      {pricing?.sizes.length ? (
        <>
          <Separator />
          <div className="space-y-3">
            <Label className="text-base font-semibold">Kích thước</Label>
            <div className="flex flex-wrap gap-2">
              {pricing.sizes.map((size) => (
                <button
                  key={size.id}
                  type="button"
                  onClick={() => setSelectedSizeId(size.id)}
                  className={`rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${selectedSizeId === size.id ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/60"}`}
                >
                  {size.code}
                  {size.weightRange ? (
                    <span className="ml-1 text-xs font-normal opacity-80">
                      ({size.weightRange})
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
            {pricing.sizeGuideImageUrl ? (
              <a
                href={pricing.sizeGuideImageUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                Xem bảng hướng dẫn chọn size
              </a>
            ) : null}
          </div>
        </>
      ) : null}

      <div className="rounded-xl border border-amber-300/70 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-950 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
        <div className="flex gap-2">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <p>
            <strong>Lưu ý:</strong> Giá sản phẩm có thể thay đổi theo chất liệu,
            số lượng và kỹ thuật in. Vui lòng liên hệ hoặc nhấn{" "}
            <strong>Nhận báo giá</strong> để được tư vấn và nhận giá chính thức.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row">
        <QuoteButton
          prefill={{ productType: quoteProductType, quantity: "" }}
          className="h-11 flex-1 rounded-lg text-base"
        />
        <Button
          render={
            <a href={zaloUrl} target="_blank" rel="noopener noreferrer" />
          }
          nativeButton={false}
          type="button"
          variant="outline"
          size="lg"
          className="h-11 flex-1 rounded-lg border-[#0068ff] text-base font-bold text-[#0068ff] hover:border-[#0058d9] hover:bg-[#0068ff]/10 hover:text-[#0058d9]"
        >
          <img src="/zalo.webp" alt="" className="mr-2 size-5 object-contain" />
          Tư vấn qua Zalo
        </Button>
      </div>
    </div>
  );
}
