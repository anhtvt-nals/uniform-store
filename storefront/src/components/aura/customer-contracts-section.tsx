import {getTranslations} from 'next-intl/server';
import {CustomerContractsClient} from './customer-contracts-client';

interface CustomerContractResponse {
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

async function getContracts(): Promise<CustomerContractResponse[]> {
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

                <CustomerContractsClient contracts={contracts} />
            </div>
        </section>
    );
}
