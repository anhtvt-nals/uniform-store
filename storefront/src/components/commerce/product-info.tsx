"use client";

import { useEffect, useState, useMemo, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Loader2, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { Price } from "@/components/commerce/price";
import { useTranslations } from "next-intl";
import { addToCart } from "@/app/[locale]/product/[slug]/actions";

interface ProductInfoProps {
  product: {
    id: string;
    slug: string;
    name: string;
    description: string;
    sortDescription?: string | null;
    detail?: string | null;
    variants: Array<{
      id: string;
      name: string;
      sku: string;
      priceWithTax: number;
      stockLevel: string;
      options: Array<{
        id: string;
        code: string;
        name: string;
        groupId: string;
        group: {
          id: string;
          code: string;
          name: string;
        };
      }>;
    }>;
    optionGroups: Array<{
      id: string;
      code: string;
      name: string;
      options: Array<{
        id: string;
        code: string;
        name: string;
      }>;
    }>;
  };
  searchParams: { [key: string]: string | string[] | undefined };
  currencyCode: string;
}

export function ProductInfo({
  product,
  searchParams,
  currencyCode,
}: ProductInfoProps) {
  const t = useTranslations("Product");
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, startAddingToCart] = useTransition();
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [sizes, setSizes] = useState<Array<{id: string; code: string; weightRange: string}>>([]);
  const [sizeGuideImageUrl, setSizeGuideImageUrl] = useState("");
  const [basePrice, setBasePrice] = useState<number | null>(null);
  const [zaloUrl, setZaloUrl] = useState("https://zalo.me/0901234567");
  const [selectedSizeId, setSelectedSizeId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/v1/products/${product.slug}`).then((response) => response.ok ? response.json() : null).then((payload) => {
      const data = payload?.data || payload;
      if (!data) return;
      setSizes(data.sizes || []);
      setSizeGuideImageUrl(data.sizeGuideImageUrl || "");
      setBasePrice(Number(data.basePrice || 0));
    }).catch(() => undefined);
  }, [product.slug]);

  useEffect(() => {
    fetch("/api/v1/settings/public")
      .then((response) => response.ok ? response.json() : null)
      .then((payload) => {
        const settings = payload?.data || payload;
        if (typeof settings?.zalo_url === "string" && settings.zalo_url.trim()) setZaloUrl(settings.zalo_url);
      })
      .catch(() => undefined);
  }, []);

  // Initialize selected options from URL
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >(() => {
    const initialOptions: Record<string, string> = {};

    // Load from URL search params
    product.optionGroups.forEach((group) => {
      const paramValue = searchParams[group.code];
      if (typeof paramValue === "string") {
        // Find the option by code
        const option = group.options.find((opt) => opt.code === paramValue);
        if (option) {
          initialOptions[group.id] = option.id;
        }
      }
    });

    return initialOptions;
  });

  // Find the matching variant based on selected options
  const selectedVariant = useMemo(() => {
    return product.variants.find((variant) => variant.id === selectedVariantId) ?? null;
  }, [selectedOptions, selectedVariantId, product.variants, product.optionGroups]);

  const pathname = usePathname();
  const router = useRouter();
  const currentSearchParams = useSearchParams();

  const handleOptionChange = (groupId: string, optionId: string) => {
    setSelectedVariantId(null);
    setSelectedOptions((prev) => ({
      ...prev,
      [groupId]: optionId,
    }));

    // Find the option group and option to get their codes
    const group = product.optionGroups.find((g) => g.id === groupId);
    const option = group?.options.find((opt) => opt.id === optionId);

    if (group && option) {
      // Update URL with option code
      const params = new URLSearchParams(currentSearchParams.toString());
      params.set(group.code, option.code);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }
  };

  const selectVariant = (variant: (typeof product.variants)[number]) => {
    setSelectedVariantId(variant.id);
    const nextOptions = Object.fromEntries(
      variant.options.map((option) => [option.groupId, option.id]),
    );
    setSelectedOptions(nextOptions);

    const params = new URLSearchParams(currentSearchParams.toString());
    variant.options.forEach((option) => params.set(option.group.code, option.code));
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleAddToCart = () => {
    if (!selectedVariant) {
      toast.error("Vui lòng chọn mã sản phẩm");
      return;
    }
    if (sizes.length && !selectedSizeId) {
      toast.error("Vui lòng chọn size sản phẩm");
      return;
    }

    startAddingToCart(async () => {
      const result = await addToCart(selectedVariant.id, quantity, selectedSizeId || undefined);
      if (!result.success) {
        toast.error(result.error || t("errorAddToCart"));
        return;
      }

      toast.success(t("addedToCartDescription", { name: product.name }));
    });
  };

  const isOutOfStock = selectedVariant?.stockLevel === "OUT_OF_STOCK";
  const stockLabel = (stockLevel: string) =>
    stockLevel === "OUT_OF_STOCK" ? t("outOfStock") : t("inStock");

  return (
    <div className="space-y-6">
      {/* Product Title & Price */}
      <div className="space-y-2">
        <h1 className="font-category-title text-3xl md:text-4xl tracking-tight">
          {product.name}
        </h1>
        {selectedVariant || basePrice !== null ? (
          <p className="mt-3 text-3xl font-extrabold tracking-tight text-primary md:text-4xl">
            <Price
              value={selectedVariant?.priceWithTax ?? basePrice ?? 0}
              currencyCode={currencyCode}
            />
          </p>
        ) : <div className="mt-3 h-10 w-32 animate-pulse rounded bg-muted" />}

        {product.sortDescription && (
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">{product.sortDescription}</p>
        )}
      </div>

      <Separator />

      {/* Option Groups */}
      {product.optionGroups.length > 0 && (
        <div className="space-y-5">
          {product.optionGroups.map((group) => (
            <div key={group.id} className="space-y-3">
              <Label className="text-base font-semibold">{group.name}</Label>
              <RadioGroup
                value={selectedOptions[group.id] || ""}
                onValueChange={(value) => handleOptionChange(group.id, value)}
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {group.options.map((option) => (
                    <div key={option.id}>
                      <RadioGroupItem
                        value={option.id}
                        id={option.id}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={option.id}
                        className="flex items-center justify-center rounded-lg border-2 border-muted bg-popover px-4 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground peer-data-[checked]:border-primary peer-data-[checked]:ring-2 peer-data-[checked]:ring-primary/20 peer-data-[checked]:bg-primary/5 cursor-pointer transition-all"
                      >
                        {option.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>
          ))}
        </div>
      )}

      {product.variants.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Mã sản phẩm
          </h3>
          <div className="space-y-2">
            {product.variants.map((variant) => {
              const isSelected = variant.id === selectedVariant?.id;

              return (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => selectVariant(variant)}
                  className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left transition-colors ${isSelected ? "border-primary bg-primary/5" : "border-border bg-background hover:border-primary/40"}`}
                >
                  <span>
                    <span className="block text-sm font-semibold text-foreground">{variant.name}</span>
                    <span className="block text-xs text-muted-foreground">
                      SKU: {variant.sku || "—"} · {stockLabel(variant.stockLevel)}
                    </span>
                  </span>
                  <span className="ml-3 shrink-0 text-sm font-bold text-primary">
                    <Price value={variant.priceWithTax} currencyCode={currencyCode} />
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {sizes.length > 0 && (
        <div className="space-y-3">
          <Label className="text-base font-semibold">Kích thước</Label>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => <button key={size.id} type="button" onClick={() => setSelectedSizeId(size.id)} className={`rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${selectedSizeId === size.id ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/60"}`}>
              {size.code}{size.weightRange ? <span className="ml-1 text-xs font-normal opacity-80">({size.weightRange})</span> : null}
            </button>)}
          </div>
          {sizeGuideImageUrl ? <a href={sizeGuideImageUrl} target="_blank" rel="noreferrer" className="inline-block text-sm font-medium text-primary underline-offset-4 hover:underline">Xem bảng hướng dẫn chọn size</a> : null}
        </div>
      )}

      <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-end">
        <div className="w-full space-y-2 sm:w-28">
          <Label htmlFor="quantity">Số lượng</Label>
          <Input
            id="quantity"
            type="number"
            min={1}
            max={10000}
            value={quantity}
            onChange={(event) => setQuantity(Math.min(10000, Math.max(1, Number(event.target.value) || 1)))}
            className="h-11"
          />
        </div>
        <Button
          type="button"
          size="lg"
          className="h-11 flex-1 rounded-lg text-base font-bold"
          disabled={!selectedVariant || (sizes.length > 0 && !selectedSizeId) || isOutOfStock || isAddingToCart}
          onClick={handleAddToCart}
        >
          {isAddingToCart ? <Loader2 className="mr-2 size-5 animate-spin" /> : <ShoppingCart className="mr-2 size-5" />}
          {isOutOfStock ? t("outOfStock") : isAddingToCart ? t("adding") : t("addToCart")}
        </Button>
        <Button render={<a href={zaloUrl} target="_blank" rel="noopener noreferrer" />} nativeButton={false} type="button" variant="outline" size="lg" className="h-11 flex-1 rounded-lg border-[#0068ff] text-base font-bold text-[#0068ff] hover:border-[#0058d9] hover:bg-[#0068ff]/10 hover:text-[#0058d9]">
          <img src="/zalo.webp" alt="" className="mr-2 size-5 object-contain" />Tư vấn qua Zalo
        </Button>
      </div>

      {/* SKU */}
      {selectedVariant && (
        <div className="text-xs text-muted-foreground">
          {t("sku", { sku: selectedVariant.sku })}
        </div>
      )}
    </div>
  );
}
