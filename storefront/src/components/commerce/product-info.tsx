'use client';

import {useState, useMemo, useTransition} from 'react';
import {usePathname, useRouter, useSearchParams} from 'next/navigation';


import {Button} from '@/components/ui/button';
import {Label} from '@/components/ui/label';
import {Input} from '@/components/ui/input';
import {RadioGroup, RadioGroupItem} from '@/components/ui/radio-group';
import {Separator} from '@/components/ui/separator';
import {CheckCircle2, Send, Loader2} from 'lucide-react';
import {toast} from 'sonner';
import {Price} from '@/components/commerce/price';
import {useTranslations} from 'next-intl';

interface ProductInfoProps {
    product: {
        id: string;
        name: string;
        description: string;
        sortDescription?: string;
        detail?: string;
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

export function ProductInfo({product, searchParams, currencyCode}: ProductInfoProps) {
    const t = useTranslations('Product');
    const [isPending, startTransition] = useTransition();
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        company: '',
        quantity: 1,
        notes: '',
    });

    // Initialize selected options from URL
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
        const initialOptions: Record<string, string> = {};

        // Load from URL search params
        product.optionGroups.forEach((group) => {
            const paramValue = searchParams[group.code];
            if (typeof paramValue === 'string') {
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

        // If not all option groups have a selection, return null
        if (Object.keys(selectedOptions).length !== product.optionGroups.length) {
            return null;
        }

        // Find variant that matches all selected options
        return product.variants.find((variant) => {
            const variantOptionIds = variant.options.map((opt) => opt.id);
            const selectedOptionIds = Object.values(selectedOptions);
            return selectedOptionIds.every((optId) => variantOptionIds.includes(optId));
        });
    }, [selectedOptions, product.variants, product.optionGroups]);

    const pathname = usePathname();
    const router = useRouter();
    const currentSearchParams = useSearchParams();

    const handleOptionChange = (groupId: string, optionId: string) => {
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
            router.push(`${pathname}?${params.toString()}`, {scroll: false});
        }
    };

    const handleSubmitInquiry = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/v1/inquiries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: product.id,
                    ...formData,
                }),
            });
            if (res.ok) {
                setIsSubmitted(true);
                toast.success(t('inquirySubmitted'));
            } else {
                toast.error(t('inquiryError'));
            }
        } catch {
            toast.error(t('inquiryError'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'quantity' ? Math.max(1, Number(value)) : value }));
    };

    return (
        <div className="space-y-6">
            {/* Product Title & Price */}
            <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{product.name}</h1>
                {selectedVariant && (
                    <p className="text-2xl md:text-3xl text-muted-foreground font-semibold mt-3">
                        <Price value={selectedVariant.priceWithTax} currencyCode={currencyCode}/>
                    </p>
                )}
            </div>

            <Separator />

            {/* Product Description */}
            <div className="prose prose-sm max-w-none text-muted-foreground">
                <div dangerouslySetInnerHTML={{__html: product.description}}/>
            </div>


            {/* Option Groups */}
            {product.optionGroups.length > 0 && (
                <div className="space-y-5">
                    {product.optionGroups.map((group) => (
                        <div key={group.id} className="space-y-3">
                            <Label className="text-base font-semibold">
                                {group.name}
                            </Label>
                            <RadioGroup
                                value={selectedOptions[group.id] || ''}
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

            {/* Inquiry Form */}
            {isSubmitted ? (
                <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center space-y-2">
                    <CheckCircle2 className="h-10 w-10 text-green-600 mx-auto" />
                    <h3 className="font-semibold text-green-800 dark:text-green-200">{t('inquirySuccess')}</h3>
                    <p className="text-sm text-green-600 dark:text-green-400">{t('inquirySuccessDesc')}</p>
                </div>
            ) : (
                <form onSubmit={handleSubmitInquiry} className="space-y-4 border rounded-lg p-5 bg-card">
                    <h3 className="font-semibold text-lg">{t('inquiryTitle')}</h3>

                    <div className="space-y-1">
                        <Label htmlFor="fullName">{t('inquiryName')} *</Label>
                        <Input
                            id="fullName"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            required
                            placeholder={t('inquiryNamePlaceholder')}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label htmlFor="email">{t('inquiryEmail')} *</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                                placeholder={t('inquiryEmailPlaceholder')}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="phone">{t('inquiryPhone')}</Label>
                            <Input
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder={t('inquiryPhonePlaceholder')}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label htmlFor="company">{t('inquiryCompany')}</Label>
                            <Input
                                id="company"
                                name="company"
                                value={formData.company}
                                onChange={handleInputChange}
                                placeholder={t('inquiryCompanyPlaceholder')}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="quantity">{t('inquiryQuantity')} *</Label>
                            <Input
                                id="quantity"
                                name="quantity"
                                type="number"
                                min={1}
                                value={formData.quantity}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="notes">{t('inquiryNotes')}</Label>
                        <textarea
                            id="notes"
                            name="notes"
                            value={formData.notes}
                            onChange={handleInputChange}
                            rows={3}
                            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            placeholder={t('inquiryNotesPlaceholder')}
                        />
                    </div>

                    <Button
                        type="submit"
                        size="lg"
                        className="w-full h-12 text-base font-semibold rounded-lg"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                {t('inquirySending')}
                            </>
                        ) : (
                            <>
                                <Send className="mr-2 h-5 w-5" />
                                {t('inquirySubmit')}
                            </>
                        )}
                    </Button>
                </form>
            )}

            {/* SKU */}
            {selectedVariant && (
                <div className="text-xs text-muted-foreground">
                    {t('sku', {sku: selectedVariant.sku})}
                </div>
            )}
        </div>
    );
}
