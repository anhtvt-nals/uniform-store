import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { query } from "@/lib/vendure/api";
import { GetProductDetailQuery } from "@/lib/vendure/queries";
import { ProductImageCarousel } from "@/components/commerce/product-image-carousel";
import { ProductInfo } from "@/components/commerce/product-info";
import { getDisplayOptionGroups } from "@/lib/vendure/product-options";
import { RelatedProducts } from "@/components/commerce/related-products";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { notFound } from "next/navigation";
import { Truck, RotateCcw, ShieldCheck, Clock } from "lucide-react";
import { routing } from "@/i18n/routing";
import {
  SITE_NAME,
  truncateDescription,
  buildCanonicalUrl,
  buildOgImages,
} from "@/lib/metadata";
import { getTranslations } from "next-intl/server";
import { toOgLocale } from "@/i18n/locale-utils";
import { getActiveCurrencyCode } from "@/lib/currency-server";
import { getRouteLocale } from "@/i18n/server";

async function getProductData(slug: string, currencyCode: string) {
  const locale = await getRouteLocale();

  return await query(
    GetProductDetailQuery,
    { slug },
    { languageCode: locale, currencyCode },
  );
}

function getProductKeywords(
  productName: string,
  collectionName?: string,
): string[] {
  return Array.from(
    new Set(
      [
        productName,
        collectionName,
        `${productName} Minh An Uniform`,
        "đồng phục doanh nghiệp",
        "may đồng phục theo yêu cầu",
        "đặt may đồng phục",
        "đồng phục chất lượng cao",
        "xưởng may đồng phục",
        SITE_NAME,
      ].filter((keyword): keyword is string => Boolean(keyword)),
    ),
  );
}

function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getRouteLocale();
  const currencyCode = await getActiveCurrencyCode();
  const result = await getProductData(slug, currencyCode);
  const product = result.data.product;

  const t = await getTranslations({ locale, namespace: "Product" });

  if (!product) {
    return {
      title: t("notFound"),
    };
  }

  const description = truncateDescription(product.description);
  const fallbackDescription = t("shopProductAt", {
    name: product.name,
    siteName: SITE_NAME,
  });
  const ogImage = product.assets?.[0]?.preview;
  const ogLocale = toOgLocale(locale);
  const productPath = `/product/${product.slug}`;
  const primaryCollection =
    product.collections?.find((collection) => collection.parent?.id) ??
    product.collections?.[0];

  return {
    title: product.name,
    description: description || fallbackDescription,
    keywords: getProductKeywords(product.name, primaryCollection?.name),
    category: primaryCollection?.name || "Đồng phục doanh nghiệp",
    authors: [{ name: SITE_NAME }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    alternates: {
      canonical: buildCanonicalUrl(`/${locale}${productPath}`),
      languages: Object.fromEntries(
        routing.locales.map((l) => [
          l,
          buildCanonicalUrl(`/${l}${productPath}`),
        ]),
      ),
    },
    openGraph: {
      title: product.name,
      description: description || fallbackDescription,
      type: "website",
      siteName: SITE_NAME,
      locale: ogLocale,
      url: buildCanonicalUrl(`/${locale}${productPath}`),
      images: buildOgImages(ogImage, product.name),
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: description || fallbackDescription,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function ProductDetailPage({
  params,
}: PageProps<"/[locale]/product/[slug]">) {
  const { slug } = await params;
  const locale = await getRouteLocale();
  const currencyCode = await getActiveCurrencyCode();
  const t = await getTranslations({ locale, namespace: "Product" });

  const result = await getProductData(slug, currencyCode);

  const product = result.data.product;

  if (!product) {
    notFound();
  }

  // Get the primary collection (prefer deepest nested / most specific)
  const primaryCollection =
    product.collections?.find((c) => c.parent?.id) ?? product.collections?.[0];
  const productPath = `/product/${product.slug}`;
  const productUrl = buildCanonicalUrl(`/${locale}${productPath}`);
  const productImages =
    product.assets?.map((asset) => asset.preview).filter(Boolean) ?? [];
  const variantPrices = product.variants
    .map((variant) => variant.priceWithTax)
    .filter((price) => price >= 0);
  const lowestPrice = Math.min(...variantPrices);
  const highestPrice = Math.max(...variantPrices);
  const isInStock = product.variants.some(
    (variant) => variant.stockLevel !== "OUT_OF_STOCK",
  );
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: truncateDescription(product.description, 500),
    image: productImages,
    sku: product.variants[0]?.sku || product.id,
    category: primaryCollection?.name || "Đồng phục doanh nghiệp",
    brand: { "@type": "Brand", name: SITE_NAME },
    offers:
      variantPrices.length > 0
        ? {
            "@type": variantPrices.length > 1 ? "AggregateOffer" : "Offer",
            url: productUrl,
            priceCurrency: currencyCode,
            ...(variantPrices.length > 1
              ? {
                  lowPrice: lowestPrice,
                  highPrice: highestPrice,
                  offerCount: product.variants.length,
                }
              : { price: lowestPrice }),
            availability: isInStock
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
            itemCondition: "https://schema.org/NewCondition",
          }
        : undefined,
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: t("home"),
        item: buildCanonicalUrl(`/${locale}`),
      },
      ...(primaryCollection
        ? [
            {
              "@type": "ListItem",
              position: 2,
              name: primaryCollection.name,
              item: buildCanonicalUrl(
                `/${locale}/collection/${primaryCollection.slug}`,
              ),
            },
          ]
        : []),
      {
        "@type": "ListItem",
        position: primaryCollection ? 3 : 2,
        name: product.name,
        item: productUrl,
      },
    ],
  };

  // Hide options that belong to a shared option group but have no variant on
  // this product (Vendure 3.6 shared/global option groups).
  const productForDisplay = {
    ...product,
    optionGroups: getDisplayOptionGroups(product),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
      />
      <div className="bg-[#F8FAFC]">
      <div className="container mx-auto max-w-[1400px] px-4 py-7 md:px-6 md:py-10 lg:px-8">
        {/* Breadcrumb Navigation */}
        <Breadcrumb className="mb-7 text-sm text-[#64748B] md:mb-9">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink className="text-[#64748B] hover:text-[#2563A8]" render={<Link href="/" />}>
                {t("home")}
              </BreadcrumbLink>
            </BreadcrumbItem>
            {primaryCollection && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink
                    className="text-[#64748B] hover:text-[#2563A8]"
                    render={
                      <Link href={`/collection/${primaryCollection.slug}`} />
                    }
                  >
                    {primaryCollection.name}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            )}
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="max-w-48 truncate font-medium text-[#334155] sm:max-w-xs">{product.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-14 xl:gap-16">
          {/* Left Column: Image Carousel */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <ProductImageCarousel images={product.assets} />
          </div>

          {/* Right Column: Product Info */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 md:p-8">
            <ProductInfo
              product={{
                ...productForDisplay,
                categoryName: primaryCollection?.name ?? null,
              }}
              currencyCode={currencyCode}
            />
          </div>
        </div>
      </div>
      </div>

      {/* Shipping & Trust Badges */}
      <section className="border-y border-[#E2E8F0] bg-white py-10 md:py-12">
        <div className="container mx-auto max-w-[1400px] px-4 md:px-6 lg:px-8">
          <div className="mb-7 max-w-2xl md:mb-8">
            <h2 className="text-[22px] font-bold tracking-[-0.01em] text-[#173B6C] md:text-2xl">Vì sao doanh nghiệp chọn Minh An Uniform?</h2>
            <p className="mt-2 text-sm leading-6 text-[#64748B]">Quy trình rõ ràng, chất lượng đồng bộ và hỗ trợ sát nhu cầu thực tế của doanh nghiệp.</p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
            {[
              { icon: Truck, text: t("trustBadges.fastShipping") },
              { icon: RotateCcw, text: t("trustBadges.freeReturns") },
              { icon: ShieldCheck, text: t("trustBadges.secureCheckout") },
              { icon: Clock, text: t("trustBadges.guarantee") },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3.5 text-sm font-medium leading-5 text-[#475569]">
                <Icon className="size-5 shrink-0 text-[#2563A8]" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Store FAQ Section */}
      <section className="bg-[#F8FAFC] py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="mb-8 text-center text-[22px] font-bold tracking-[-0.01em] text-[#173B6C] md:text-2xl">
            {t("faq.title")}
          </h2>
          <Accordion className="w-full">
            <AccordionItem value="shipping">
              <AccordionTrigger>{t("faq.shipping.question")}</AccordionTrigger>
              <AccordionContent>{t("faq.shipping.answer")}</AccordionContent>
            </AccordionItem>
            <AccordionItem value="returns">
              <AccordionTrigger>{t("faq.returns.question")}</AccordionTrigger>
              <AccordionContent>{t("faq.returns.answer")}</AccordionContent>
            </AccordionItem>
            <AccordionItem value="tracking">
              <AccordionTrigger>{t("faq.tracking.question")}</AccordionTrigger>
              <AccordionContent>{t("faq.tracking.answer")}</AccordionContent>
            </AccordionItem>
            <AccordionItem value="international">
              <AccordionTrigger>
                {t("faq.international.question")}
              </AccordionTrigger>
              <AccordionContent>
                {t("faq.international.answer")}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {primaryCollection && (
        <RelatedProducts
          collectionSlug={primaryCollection.slug}
          currentProductId={product.id}
        />
      )}
    </>
  );
}
