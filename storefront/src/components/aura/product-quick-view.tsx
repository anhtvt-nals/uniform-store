"use client";

import { useState, useMemo, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Send,
  CheckCircle2,
  Loader2,
  ArrowRight,
} from "lucide-react";

import { getProductForQuickView } from "./quick-view-actions";
import { toast } from "sonner";

interface QuickViewProduct {
  id: string;
  name: string;
  description: string;
  sortDescription?: string;
  basePrice: number;
  isContactPrice: boolean;
  slug: string;
  assets: Array<{ id: string; preview: string; source: string }>;
  variants: Array<{
    id: string;
    name: string;
    sku: string;
    priceWithTax: number;
    stockLevel: string;
    options: Array<{ id: string; code: string; name: string; groupId: string }>;
  }>;
  optionGroups: Array<{
    id: string;
    code: string;
    name: string;
    options: Array<{ id: string; code: string; name: string }>;
  }>;
  sizes?: Array<{ id: string; code: string; weightRange: string }>;
  sizeGuideImageUrl?: string;
}

type InquirySelection = {
  variantId: string;
  variantName: string;
  variantSku: string;
  sizeId?: string;
  sizeName?: string;
};

export function ProductQuickView({
  slug,
  onClose,
}: {
  slug: string;
  onClose: () => void;
}) {
  const t = useTranslations("Product");
  const [product, setProduct] = useState<QuickViewProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    null,
  );
  const [selectedSizeId, setSelectedSizeId] = useState<string | null>(null);
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [inquirySelection, setInquirySelection] =
    useState<InquirySelection | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    quantity: 1,
    notes: "",
  });

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    getProductForQuickView(slug)
      .then((p) => {
        if (!active) return;
        if (!p) {
          setError(t("notFound"));
        } else {
          setProduct(p as QuickViewProduct);
          setSelectedVariantId(null);
          setSelectedOptions({});
          setInquirySelection(null);
        }
      })
      .catch(() => active && setError(t("errorTitle")))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [slug, t]);

  const selectedVariant = useMemo(() => {
    if (!product) return null;
    return (
      product.variants.find((variant) => variant.id === selectedVariantId) ||
      null
    );
  }, [product, selectedOptions, selectedVariantId]);

  const handleOptionChange = (groupId: string, optionId: string) => {
    setSelectedOptions((prev) => ({ ...prev, [groupId]: optionId }));
    setSelectedVariantId(null);
  };

  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquirySelection) {
      toast.error("Vui lòng chọn mã sản phẩm");
      return;
    }
    if (product?.sizes?.length && !inquirySelection.sizeId) {
      toast.error("Vui lòng chọn size sản phẩm");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/v1/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product?.id,
          sizeId: inquirySelection.sizeId,
          ...formData,
          notes: [
            `Mã sản phẩm: ${inquirySelection.variantName}${inquirySelection.variantSku ? ` (${inquirySelection.variantSku})` : ""}`,
            inquirySelection.sizeName
              ? `Size: ${inquirySelection.sizeName}`
              : "",
            formData.notes.trim(),
          ]
            .filter(Boolean)
            .join("\n"),
        }),
      });
      if (res.ok) {
        setIsSubmitted(true);
        toast.success(t("inquirySubmitted"));
      } else {
        toast.error(t("inquiryError"));
      }
    } catch {
      toast.error(t("inquiryError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const openInquiryForm = () => {
    if (!selectedVariant) {
      toast.error("Vui lòng chọn mã sản phẩm");
      return;
    }
    if (product?.sizes?.length && !selectedSizeId) {
      toast.error("Vui lòng chọn size sản phẩm");
      return;
    }
    setInquirySelection({
      variantId: selectedVariant.id,
      variantName: selectedVariant.name,
      variantSku: selectedVariant.sku,
      sizeId: selectedSizeId || undefined,
      sizeName: selectedSize?.code,
    });
    setShowInquiryForm(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "quantity" ? Math.max(1, Number(value)) : value,
    }));
  };

  const formatVnd = (value: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value);

  const stockLabel = (stockLevel: string) => {
    if (stockLevel === "OUT_OF_STOCK") return t("outOfStock");
    return t("inStock");
  };

  const selectedSize = product?.sizes?.find(
    (size) => size.id === selectedSizeId,
  );
  const requiresSize = Boolean(product?.sizes?.length);

  const images = product?.assets?.length
    ? product.assets
    : product
      ? [{ id: "placeholder", preview: "", source: "" }]
      : [];
  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImage((p) => (p + 1) % images.length);
  };
  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImage((p) => (p - 1 + images.length) % images.length);
  };

  // Close on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-foreground/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-background rounded-[32px] w-full max-w-6xl shadow-2xl grid grid-cols-1 grid-rows-[minmax(14rem,36vh)_minmax(0,1fr)] md:grid-cols-2 md:grid-rows-1 relative h-[88dvh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted-foreground/20 transition z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        {loading ? (
          <div className="md:col-span-2 flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">
              {t("noImage") === "No image" ? "Loading..." : "Đang tải..."}
            </p>
          </div>
        ) : error || !product ? (
          <div className="md:col-span-2 flex flex-col items-center justify-center py-24 gap-4">
            <p className="text-sm text-muted-foreground">
              {error || t("notFound")}
            </p>
            <button
              onClick={onClose}
              className="bg-primary text-primary-foreground rounded-full px-6 py-2.5 text-xs font-bold uppercase tracking-widest"
            >
              {t("home")}
            </button>
          </div>
        ) : (
          <>
            {/* Image gallery */}
            <div className="relative h-full bg-muted group min-h-0 md:rounded-l-[32px] overflow-hidden">
              {images[currentImage]?.source ? (
                <img
                  src={images[currentImage].source}
                  className="w-full h-full object-contain absolute inset-0 p-4"
                  alt={product.name}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                  {t("noImage")}
                </div>
              )}

              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center hover:bg-background transition text-foreground opacity-0 group-hover:opacity-100 shadow-lg z-20"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center hover:bg-background transition text-foreground opacity-0 group-hover:opacity-100 shadow-lg z-20"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                    {images.map((_, idx) => (
                      <div
                        key={idx}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentImage ? "bg-foreground w-4" : "bg-foreground/40"}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Info */}
            <div className="min-h-0 overflow-hidden p-6 md:p-8 lg:p-12 flex flex-col justify-start relative bg-background">
              <div className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase mb-4">
                {product.optionGroups[0]?.name ||
                  t("sku", { sku: product.variants[0]?.sku || "" })}
              </div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-foreground mb-2">
                {product.name}
              </h2>
              {product.sortDescription && (
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {product.sortDescription}
                </p>
              )}
              <div className="text-2xl font-bold text-primary mb-6">
                {product.isContactPrice
                  ? "Giá liên hệ"
                  : formatVnd(
                      selectedVariant?.priceWithTax ?? product.basePrice,
                    )}
              </div>

              {/* Option groups */}
              {product.optionGroups.length > 0 && (
                <div className="space-y-5 mb-6">
                  {product.optionGroups.map((group) => (
                    <div key={group.id}>
                      <div className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase mb-2">
                        {group.name}:{" "}
                        {group.options.find(
                          (o) => o.id === selectedOptions[group.id],
                        )?.name || "—"}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {group.options.map((option) => (
                          <button
                            key={option.id}
                            onClick={() =>
                              handleOptionChange(group.id, option.id)
                            }
                            className={`px-4 h-10 rounded-xl border flex items-center justify-center font-bold text-xs transition-all ${
                              selectedOptions[group.id] === option.id
                                ? "bg-foreground text-background border-foreground"
                                : "bg-background text-foreground border-border hover:border-foreground"
                            }`}
                          >
                            {option.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
                {product.variants.length > 0 && (
                  <div className="mb-6 space-y-2">
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
                            onClick={() => {
                              setSelectedVariantId(variant.id);
                              setSelectedOptions(
                                Object.fromEntries(
                                  variant.options.map((option) => [
                                    option.groupId,
                                    option.id,
                                  ]),
                                ),
                              );
                            }}
                            className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left transition-colors ${
                              isSelected
                                ? "border-primary bg-primary/5"
                                : "border-border bg-background hover:border-primary/40"
                            }`}
                          >
                            <span>
                              <span className="block text-sm font-semibold text-foreground">
                                {variant.name}
                              </span>
                              <span className="block text-xs text-muted-foreground">
                                SKU: {variant.sku || "—"} ·{" "}
                                {stockLabel(variant.stockLevel)}
                              </span>
                            </span>
                            <span className="text-sm font-bold text-primary">
                              {product.isContactPrice
                                ? "Giá liên hệ"
                                : formatVnd(variant.priceWithTax)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {product.sizes?.length ? (
                  <div className="mb-6 space-y-2">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Kích thước
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((size) => (
                        <button
                          key={size.id}
                          type="button"
                          onClick={() => setSelectedSizeId(size.id)}
                          className={`rounded-lg border px-3 py-2 text-xs font-bold transition-colors ${selectedSizeId === size.id ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/50"}`}
                        >
                          {size.code}
                          {size.weightRange ? ` (${size.weightRange})` : ""}
                        </button>
                      ))}
                    </div>
                    {product.sizeGuideImageUrl ? (
                      <a
                        className="text-xs font-medium text-primary hover:underline"
                        href={product.sizeGuideImageUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Xem bảng hướng dẫn chọn size
                      </a>
                    ) : null}
                  </div>
                ) : null}

                {/* Inquiry Form */}
                {isSubmitted ? (
                  <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl p-5 text-center space-y-2 mb-4">
                    <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto" />
                    <h4 className="font-semibold text-green-800 dark:text-green-200">
                      {t("inquirySuccess")}
                    </h4>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      {t("inquirySuccessDesc")}
                    </p>
                  </div>
                ) : showInquiryForm ? (
                  <form
                    onSubmit={handleSubmitInquiry}
                    className="mb-4 space-y-3 rounded-2xl border border-primary/20 bg-primary/[0.03] p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-bold text-foreground">
                          Gửi yêu cầu báo giá
                        </h4>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Chúng tôi sẽ liên hệ để tư vấn và báo giá chính xác.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowInquiryForm(false)}
                        className="shrink-0 text-xs font-medium text-muted-foreground hover:text-foreground"
                      >
                        Thu gọn
                      </button>
                    </div>
                    <div className="rounded-xl border border-border/70 bg-background p-3 text-xs">
                      <div className="font-semibold text-foreground">
                        {product.name}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-muted-foreground">
                        <span>
                          {inquirySelection?.variantName ||
                            "Chưa chọn mã sản phẩm"}
                        </span>
                        {inquirySelection?.sizeName ? (
                          <span>
                            Size:{" "}
                            <strong className="font-semibold text-foreground">
                              {inquirySelection.sizeName}
                            </strong>
                          </span>
                        ) : null}
                        <span>
                          Số lượng:{" "}
                          <strong className="font-semibold text-foreground">
                            {formData.quantity}
                          </strong>
                        </span>
                      </div>
                    </div>
                    <input
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      placeholder={t("inquiryNamePlaceholder")}
                      className="w-full h-10 rounded-xl border border-border bg-background px-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder={t("inquiryEmailPlaceholder")}
                        className="w-full h-10 rounded-xl border border-border bg-background px-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                      <input
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder={t("inquiryPhonePlaceholder")}
                        className="w-full h-10 rounded-xl border border-border bg-background px-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-3 py-2">
                      <span className="text-xs font-medium text-muted-foreground">
                        Số lượng cần báo giá
                      </span>
                      <input
                        name="quantity"
                        type="number"
                        min={1}
                        value={formData.quantity}
                        onChange={handleInputChange}
                        required
                        className="h-8 w-20 rounded-lg border border-border bg-background px-2 text-center text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                    </div>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={2}
                      placeholder={t("inquiryNotesPlaceholder")}
                      className="w-full rounded-xl border border-border bg-background px-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-xs font-bold uppercase tracking-widest text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />{" "}
                          {t("inquirySending")}
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" /> {t("inquirySubmit")}
                        </>
                      )}
                    </button>
                  </form>
                ) : null}
              </div>

              {!showInquiryForm && !isSubmitted && (
                <button
                  type="button"
                  onClick={openInquiryForm}
                  disabled={
                    !selectedVariant || (requiresSize && !selectedSizeId)
                  }
                  className="mt-4 flex w-full shrink-0 items-center justify-center gap-2 rounded-full bg-foreground py-3.5 text-xs font-bold uppercase tracking-widest text-background transition hover:bg-muted-foreground disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <Send className="h-4 w-4" /> {t("inquiryTitle")}
                </button>
              )}
              {!showInquiryForm &&
              !isSubmitted &&
              (!selectedVariant || (requiresSize && !selectedSizeId)) ? (
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  {!selectedVariant
                    ? "Vui lòng chọn mã sản phẩm"
                    : "Vui lòng chọn size"}{" "}
                  để gửi yêu cầu báo giá.
                </p>
              ) : null}

              {/* View Detail Link */}
              <Link
                href={`/product/${product.slug}`}
                onClick={onClose}
                className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition"
              >
                {t("viewDetail")} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
