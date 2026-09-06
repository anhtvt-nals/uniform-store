'use client';

import {ProductTile} from "@/components/aura/product-tile";
import {Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious,} from "@/components/ui/carousel";
import {FragmentOf} from "@/graphql";
import {ProductCardFragment} from "@/lib/vendure/fragments";
import {useId} from "react";

interface ProductCarouselClientProps {
    title: string;
    products: Array<FragmentOf<typeof ProductCardFragment>>;
    quickView?: boolean;
}

export function ProductCarousel({title, products, quickView = true}: ProductCarouselClientProps) {
    const id = useId();

    return (
        <section className="py-12 md:py-16">
            <div className="container mx-auto px-4">
                <h2 className="font-category-title mb-8 text-3xl md:text-4xl">{title}</h2>
                <Carousel
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                    className="w-full"
                >
                    <CarouselContent className="-ml-2 md:-ml-4">
                        {products.map((product, i) => (
                            <CarouselItem key={id + i}
                                          className="pl-2 md:pl-4 basis-1/2 lg:basis-1/4 xl:basis-1/5">
                                <ProductTile product={product} compact quickView={quickView} />
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="hidden md:flex"/>
                    <CarouselNext className="hidden md:flex"/>
                </Carousel>
            </div>
        </section>
    );
}
