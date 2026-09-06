"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  const [isDetailExpanded, setIsDetailExpanded] = useState(false);
  const [hasExpandableDetail, setHasExpandableDetail] = useState(false);
  const detailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPricing(null);
    setSelectedSizeId(null);
    setIsDetailExpanded(false);
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
    if (isDetailExpanded) {
      setHasExpandableDetail(true);
      return;
    }

    const detailElement = detailRef.current;
    if (!detailElement) {
      setHasExpandableDetail(false);
      return;
    }

    const updateExpandableState = () => {
      setHasExpandableDetail(detailElement.scrollHeight > detailElement.clientHeight + 1);
    };

    updateExpandableState();
    const observer = new ResizeObserver(updateExpandableState);
    observer.observe(detailElement);
    return () => observer.disconnect();
  }, [product.detail, isDetailExpanded]);

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
    <div className="space-y-7">
      <div className="space-y-4">
        <h1 className="text-[24px] font-bold leading-[1.2] tracking-[-0.02em] text-[#172033] md:text-[26px] xl:text-[28px]">
          {product.name}
        </h1>
        {pricing ? (
          <div className="border-l-2 border-[#C9A227] pl-4">
            {pricing.isContactPrice ? (
              <>
                <p className="text-2xl font-bold tracking-[-0.02em] text-[#2563A8] md:text-[28px]">Giá liên hệ</p>
                <p className="mt-1 text-sm leading-6 text-[#64748B]">Liên hệ để nhận báo giá theo số lượng và yêu cầu thực tế.</p>
              </>
            ) : (
              <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className="whitespace-nowrap text-base font-semibold text-[#334155]">Chỉ từ</span>
                <span className="text-2xl font-bold tracking-[-0.02em] text-[#2563A8] md:text-[28px]">
                  <Price value={pricing.basePrice} currencyCode={currencyCode} />
                </span>
              </p>
            )}
          </div>
        ) : (
          <div className="h-8 w-28 animate-pulse rounded bg-muted" />
        )}
        {product.detail ? (
          <div className="border-t border-[#E2E8F0] pt-5">
            <div
              ref={detailRef}
              className={`prose prose-sm max-w-none leading-7 text-[#475569] prose-headings:font-bold prose-headings:text-[#173B6C] prose-p:my-3 prose-li:my-1 prose-li:marker:text-[#2563A8] prose-a:text-[#2563A8] ${isDetailExpanded ? "max-h-56 overflow-y-auto overscroll-contain pr-2" : "max-h-32 overflow-hidden"}`}
              dangerouslySetInnerHTML={{ __html: product.detail }}
            />
            {hasExpandableDetail ? (
              <button
                type="button"
                onClick={() => setIsDetailExpanded((expanded) => !expanded)}
                aria-expanded={isDetailExpanded}
                className="mt-3 text-sm font-semibold text-[#2563A8] underline-offset-4 hover:text-[#173B6C] hover:underline"
              >
                {isDetailExpanded ? "Thu gọn" : "Xem toàn bộ thông tin sản phẩm"}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      {pricing?.sizes.length ? (
        <>
          <Separator />
          <div className="space-y-3 pt-1">
            <Label className="text-base font-semibold text-[#334155]">Kích thước</Label>
            <div className="flex flex-wrap gap-2">
              {pricing.sizes.map((size) => (
                <button
                  key={size.id}
                  type="button"
                  onClick={() => setSelectedSizeId(size.id)}
                  className={`rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${selectedSizeId === size.id ? "border-[#173B6C] bg-[#173B6C] text-white" : "border-[#E2E8F0] text-[#334155] hover:border-[#2563A8] hover:text-[#173B6C]"}`}
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
                className="inline-block text-sm font-medium text-[#2563A8] underline-offset-4 hover:underline"
              >
                Xem bảng hướng dẫn chọn size
              </a>
            ) : null}
          </div>
        </>
      ) : null}

      <div className="rounded-lg border border-[#C9A227]/35 bg-[#C9A227]/10 px-4 py-3 text-sm leading-6 text-[#475569]">
        <div className="flex gap-2">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-[#C9A227]" />
          <p>
            <strong>Lưu ý:</strong> Giá sản phẩm có thể thay đổi theo chất liệu,
            số lượng và kỹ thuật in. Vui lòng liên hệ hoặc nhấn{" "}
            <strong>Nhận báo giá</strong> để được tư vấn và nhận giá chính thức.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-[#E2E8F0] pt-6 sm:flex-row">
        <QuoteButton
          prefill={{ productType: quoteProductType, quantity: "" }}
          className="h-12 flex-1 rounded-lg bg-[#173B6C] text-base hover:bg-[#123158]"
        />
        <Button
          render={
            <a href={zaloUrl} target="_blank" rel="noopener noreferrer" />
          }
          nativeButton={false}
          type="button"
          variant="outline"
          size="lg"
          className="h-12 flex-1 rounded-lg border-[#2563A8] text-base font-semibold text-[#2563A8] hover:border-[#173B6C] hover:bg-[#2563A8]/5 hover:text-[#173B6C]"
        >
          <img src="/zalo.webp" alt="" className="mr-2 size-5 object-contain" />
          Tư vấn qua Zalo
        </Button>
      </div>
    </div>
  );
}
