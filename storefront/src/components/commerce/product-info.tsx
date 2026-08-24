"use client";

import { useState, useMemo, useTransition } from "react";
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
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    product.variants[0]?.id ?? null,
  );

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
    if (product.variants.length === 1) {
      return product.variants[0];
    }

    // Default to the first purchasable variant until the buyer selects options.
    if (Object.keys(selectedOptions).length !== product.optionGroups.length) {
      return product.variants.find((variant) => variant.id === selectedVariantId) ?? product.variants[0];
    }

    // Find variant that matches all selected options
    return product.variants.find((variant) => {
      const variantOptionIds = variant.options.map((opt) => opt.id);
      const selectedOptionIds = Object.values(selectedOptions);
      return selectedOptionIds.every((optId) =>
        variantOptionIds.includes(optId),
      );
    }) ?? product.variants.find((variant) => variant.id === selectedVariantId) ?? product.variants[0];
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
      toast.error(t("selectOptions"));
      return;
    }

    startAddingToCart(async () => {
      const result = await addToCart(selectedVariant.id, quantity);
      if (!result.success) {
        toast.error(result.error || t("errorAddToCart"));
        return;
      }

      toast.success(t("addedToCartDescription", { name: product.name }));
      router.refresh();
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
        {selectedVariant && (
          <p className="mt-3 text-3xl font-extrabold tracking-tight text-primary md:text-4xl">
            <Price
              value={selectedVariant.priceWithTax}
              currencyCode={currencyCode}
            />
          </p>
        )}
      </div>

      <Separator />

      {/* Product Description */}
      <div className="prose prose-sm max-w-none text-muted-foreground">
        <div dangerouslySetInnerHTML={{ __html: product.description }} />
      </div>

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
            Quy cách
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
          />
        </div>
        <Button
          type="button"
          size="lg"
          className="h-11 flex-1 rounded-xl text-base font-bold"
          disabled={!selectedVariant || isOutOfStock || isAddingToCart}
          onClick={handleAddToCart}
        >
          {isAddingToCart ? <Loader2 className="mr-2 size-5 animate-spin" /> : <ShoppingCart className="mr-2 size-5" />}
          {isOutOfStock ? t("outOfStock") : isAddingToCart ? t("adding") : t("addToCart")}
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
