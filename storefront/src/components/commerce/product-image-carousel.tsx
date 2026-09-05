"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductImageCarouselProps {
  images: Array<{
    id: string;
    preview: string;
    source: string;
  }>;
}

export function ProductImageCarousel({ images }: ProductImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="flex h-[340px] items-center justify-center rounded-2xl bg-[#F1F5F9] md:h-[440px] xl:h-[500px]">
        <span className="text-sm text-[#64748B]">Chưa có hình ảnh sản phẩm</span>
      </div>
    );
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="space-y-3">
      {/* Main Image */}
      <div className="group relative h-[340px] overflow-hidden rounded-2xl bg-[#F1F5F9] md:h-[440px] xl:h-[500px]">
        <Image
          src={images[currentIndex].source}
          alt={`Product image ${currentIndex + 1}`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.015]"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority={currentIndex === 0}
        />

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              className="absolute left-3 top-1/2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#E2E8F0] bg-white/90 text-[#334155] shadow-sm transition hover:bg-white"
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="absolute right-3 top-1/2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#E2E8F0] bg-white/90 text-[#334155] shadow-sm transition hover:bg-white"
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-[#172033]/75 px-2.5 py-1 text-xs font-medium text-white">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Scrollable thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 pr-1 [scrollbar-width:thin]">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setCurrentIndex(index)}
              className={`relative aspect-square w-[72px] shrink-0 overflow-hidden rounded-lg transition-all duration-200 sm:w-20 ${
                index === currentIndex
                  ? "ring-2 ring-[#2563A8] ring-offset-2"
                  : "ring-1 ring-[#E2E8F0] opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={image.preview}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="96px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
