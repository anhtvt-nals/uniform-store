import {getTranslations} from 'next-intl/server';

interface CustomerContract {
    id: string;
    name: string;
    logoUrl: string;
    contractImageUrl: string;
    description: string;
}

const BACKEND_API_URL = (process.env.VENDURE_SHOP_API_URL || 'http://localhost:3000/shop-api').replace(
    /\/shop-api\/?$/,
    '',
);

async function getContracts(): Promise<CustomerContract[]> {
    try {
        const res = await fetch(`${BACKEND_API_URL}/api/v1/customer-contracts`, {
            next: {revalidate: 60, tags: ['customer-contracts']},
        });
        if (!res.ok) return [];
        const json = await res.json();
        return json.data || json;
    } catch {
        return [];
    }
}

export async function CustomerContractsSection({locale}: {locale: string}) {
    const contracts = await getContracts();
    const t = await getTranslations({locale, namespace: 'Home'});

    if (contracts.length === 0) return null;

    return (
        <section className="py-16 bg-muted/30">
            <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-10">
                <div className="text-center mb-10">
                    <h2 className="font-category-title text-2xl md:text-3xl">{t('customerContractsTitle') || 'Khách hàng đã ký hợp đồng'}</h2>
                    <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">{t('customerContractsDesc') || 'Hàng trăm doanh nghiệp đã tin tưởng và hợp tác cùng chúng tôi'}</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                    {contracts.map((contract) => (
                        <div
                            key={contract.id}
                            className="group bg-background rounded-xl border border-border overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-200"
                        >
                            <div className="aspect-[3/4] relative bg-muted flex items-center justify-center p-3">
                                {contract.contractImageUrl ? (
                                    <img
                                        src={contract.contractImageUrl}
                                        alt={contract.name}
                                        className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                                    />
                                ) : contract.logoUrl ? (
                                    <img
                                        src={contract.logoUrl}
                                        alt={contract.name}
                                        className="max-w-[80%] max-h-[80%] object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                                    />
                                ) : (
                                    <span className="text-sm font-semibold text-muted-foreground text-center">{contract.name}</span>
                                )}

                                {contract.logoUrl && contract.contractImageUrl && (
                                    <div className="absolute bottom-2 left-2 w-8 h-8 rounded-full bg-background/90 border border-border flex items-center justify-center p-1 shadow-sm">
                                        <img
                                            src={contract.logoUrl}
                                            alt=""
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="p-2.5 text-center">
                                <p className="text-xs font-semibold truncate">{contract.name}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
