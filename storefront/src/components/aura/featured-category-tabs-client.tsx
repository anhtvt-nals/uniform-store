import {Link} from '@/i18n/navigation';
import {FragmentOf} from '@/graphql';
import {ProductCardFragment} from '@/lib/vendure/fragments';
import {ProductTile} from './product-tile';

type CategoryShowcase = {id: string; name: string; slug: string; description: string; imageUrl?: string};

export function FeaturedCategoryTabsClient({categories, productsMap, headingLabel, noProductsLabel}: {
    categories: CategoryShowcase[];
    productsMap: Record<string, Array<FragmentOf<typeof ProductCardFragment>>>;
    headingLabel: string;
    noProductsLabel: string;
}) {
    return (
        <div className="flex flex-col">
            {categories.map((category, categoryIndex) => {
                const products = productsMap[category.slug] || [];
                return (
                    <div key={category.id}>
                        {categoryIndex > 0 && (
                            <div aria-hidden="true" className="my-16 flex items-center gap-5 text-primary/60">
                                <div className="h-px flex-1 bg-border" />
                                <span className="text-sm">✦</span>
                                <div className="h-px flex-1 bg-border" />
                            </div>
                        )}
                        <section className="grid items-stretch lg:grid-cols-5">
                            <Link href={`/collection/${category.slug}`} className="group flex h-full flex-col lg:col-span-2">
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">{headingLabel}</span>
                                <h2 className="font-category-title mt-4 bg-gradient-to-r from-primary to-cyan-600 bg-clip-text text-3xl leading-[1.05] tracking-tight text-transparent sm:text-4xl lg:text-5xl">{category.name}</h2>
                                <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">{category.description}</p>
                                {category.imageUrl && (
                                    <div className="mt-8 min-h-[320px] flex-1 overflow-hidden rounded-[28px] lg:min-h-0">
                                        <img src={category.imageUrl} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
                                    </div>
                                )}
                            </Link>
                            <div className="mt-6 flex h-full lg:col-span-3 lg:mt-0 lg:pl-10">
                                {products.length === 0 ? (
                                    <div className="flex min-h-64 items-center justify-center text-center text-sm text-muted-foreground">{noProductsLabel}</div>
                                ) : (
                                    <div className="grid h-full w-full auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                        {products.map((product, index) => <ProductTile key={index} product={product} index={index} compact />)}
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
