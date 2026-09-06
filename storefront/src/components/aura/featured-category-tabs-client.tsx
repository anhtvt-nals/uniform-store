import {Link} from '@/i18n/navigation';
import {FragmentOf} from '@/graphql';
import {ProductCardFragment} from '@/lib/vendure/fragments';
import {ProductTile} from './product-tile';

type CategoryShowcase = {id: string; name: string; slug: string; description: string};

export function FeaturedCategoryTabsClient({categories, productsMap, noProductsLabel}: {
    categories: CategoryShowcase[];
    productsMap: Record<string, Array<FragmentOf<typeof ProductCardFragment>>>;
    noProductsLabel: string;
}) {
    return (
        <div className="flex flex-col">
            {categories.map((category, categoryIndex) => {
                const products = productsMap[category.slug] || [];
                return (
                    <div key={category.id}>
                        {categoryIndex === 0 && (
                            <div aria-hidden="true" className="mb-10 flex items-center gap-5 text-primary/60 md:mb-14">
                                <div className="h-px flex-1 bg-border" />
                                <span className="text-sm">✦</span>
                                <div className="h-px flex-1 bg-border" />
                            </div>
                        )}
                        {categoryIndex > 0 && (
                            <div aria-hidden="true" className="my-10 md:my-10 flex items-center gap-5 text-primary/60">
                                <div className="h-px flex-1 bg-border" />
                                <span className="text-sm">✦</span>
                                <div className="h-px flex-1 bg-border" />
                            </div>
                        )}
                        <section>
                            <Link href={`/collection/${category.slug}`} className="group flex flex-col items-center text-center">
                                <h2 className="font-category-title bg-gradient-to-r from-primary to-cyan-600 bg-clip-text text-2xl leading-[1.05] tracking-tight text-transparent sm:text-3xl lg:text-4xl">{category.name}</h2>
                                <p className="mt-3 max-w-2xl line-clamp-3 text-sm leading-6 text-muted-foreground">{category.description}</p>
                            </Link>
                            <div className="mt-6 flex">
                                {products.length === 0 ? (
                                    <div className="flex min-h-64 items-center justify-center text-center text-sm text-muted-foreground">{noProductsLabel}</div>
                                ) : (
                                    <div className="grid w-full auto-rows-max content-start items-start grid-cols-2 gap-4 lg:grid-cols-5">
                                        {products.map((product, index) => <ProductTile key={index} product={product} compact />)}
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                );
            })}
        </div>
    );
}
