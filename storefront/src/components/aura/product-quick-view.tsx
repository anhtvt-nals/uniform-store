"use client";

import {useState, useMemo, useEffect} from 'react';
import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';
import {X, ChevronLeft, ChevronRight, Send, CheckCircle2, Loader2, ArrowRight} from 'lucide-react';
import {Price} from '@/components/commerce/price';

import {getProductForQuickView} from './quick-view-actions';
import {toast} from 'sonner';

interface QuickViewProduct {
    id: string;
    name: string;
    description: string;
    sortDescription?: string;
    slug: string;
    assets: Array<{id: string; preview: string; source: string}>;
    variants: Array<{
        id: string;
        name: string;
        sku: string;
        priceWithTax: number;
        stockLevel: string;
        options: Array<{id: string; code: string; name: string; groupId: string}>;
    }>;
    optionGroups: Array<{
        id: string;
        code: string;
        name: string;
        options: Array<{id: string; code: string; name: string}>;
    }>;
}

export function ProductQuickView({slug, onClose}: {slug: string; onClose: () => void}) {
    const t = useTranslations('Product');
    const [product, setProduct] = useState<QuickViewProduct | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentImage, setCurrentImage] = useState(0);
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
    const [currencyCode, setCurrencyCode] = useState<string>('USD');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({ fullName: '', email: '', phone: '', company: '', quantity: 1, notes: '' });

    useEffect(() => {
        let active = true;
        setLoading(true);
        setError(null);
        getProductForQuickView(slug)
            .then((p) => {
                if (!active) return;
                if (!p) {
                    setError(t('notFound'));
                } else {
                    setProduct(p as QuickViewProduct);
                    setCurrencyCode(p.variants[0] ? 'USD' : 'USD');
                }
            })
            .catch(() => active && setError(t('errorTitle')))
            .finally(() => active && setLoading(false));
        return () => {
            active = false;
        };
    }, [slug, t]);

    const selectedVariant = useMemo(() => {
        if (!product) return null;
        if (product.variants.length === 1) return product.variants[0];
        if (Object.keys(selectedOptions).length !== product.optionGroups.length) return null;
        return (
            product.variants.find((variant) => {
                const variantOptionIds = variant.options.map((opt) => opt.id);
                const selectedOptionIds = Object.values(selectedOptions);
                return selectedOptionIds.every((optId) => variantOptionIds.includes(optId));
            }) || null
        );
    }, [product, selectedOptions]);

    const handleOptionChange = (groupId: string, optionId: string) => {
        setSelectedOptions((prev) => ({...prev, [groupId]: optionId}));
    };

    const handleSubmitInquiry = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/v1/inquiries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId: product?.id, ...formData }),
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'quantity' ? Math.max(1, Number(value)) : value }));
    };

    const images = product?.assets?.length
        ? product.assets
        : product
          ? [{id: 'placeholder', preview: '', source: ''}]
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
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-foreground/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-background rounded-[32px] w-full max-w-4xl shadow-2xl grid grid-cols-1 md:grid-cols-2 relative h-[80vh] overflow-hidden"
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
                        <p className="text-sm text-muted-foreground">{t('noImage') === 'No image' ? 'Loading...' : 'Đang tải...'}</p>
                    </div>
                ) : error || !product ? (
                    <div className="md:col-span-2 flex flex-col items-center justify-center py-24 gap-4">
                        <p className="text-sm text-muted-foreground">{error || t('notFound')}</p>
                        <button onClick={onClose} className="bg-primary text-primary-foreground rounded-full px-6 py-2.5 text-xs font-bold uppercase tracking-widest">
                            {t('home')}
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Image gallery */}
                        <div className="relative h-64 md:h-full bg-muted group min-h-0 rounded-l-[32px] overflow-hidden">
                            {images[currentImage]?.source ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={images[currentImage].source}
                                    className="w-full h-full object-contain absolute inset-0 p-4"
                                    alt={product.name}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                                    {t('noImage')}
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
                                                className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentImage ? 'bg-foreground w-4' : 'bg-foreground/40'}`}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Info */}
                        <div className="p-8 lg:p-12 flex flex-col justify-start overflow-y-auto relative bg-background">
                            <div className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase mb-4">
                                {product.optionGroups[0]?.name || t('sku', {sku: product.variants[0]?.sku || ''})}
                            </div>
                            <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-foreground mb-2">{product.name}</h2>
                            {product.sortDescription && (
                                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{product.sortDescription}</p>
                            )}
                            <div className="text-2xl font-bold text-primary mb-6">
                                {selectedVariant ? (
                                    <Price value={selectedVariant.priceWithTax} currencyCode={currencyCode} />
                                ) : (
                                    <span className="text-sm font-normal text-muted-foreground">
                                        {t('selectOptions')}
                                    </span>
                                )}
                            </div>

                            {/* Option groups */}
                            {product.optionGroups.length > 0 && (
                                <div className="space-y-5 mb-6">
                                    {product.optionGroups.map((group) => (
                                        <div key={group.id}>
                                            <div className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase mb-2">
                                                {group.name}: {group.options.find((o) => o.id === selectedOptions[group.id])?.name || '—'}
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {group.options.map((option) => (
                                                    <button
                                                        key={option.id}
                                                        onClick={() => handleOptionChange(group.id, option.id)}
                                                        className={`px-4 h-10 rounded-xl border flex items-center justify-center font-bold text-xs transition-all ${
                                                            selectedOptions[group.id] === option.id
                                                                ? 'bg-foreground text-background border-foreground'
                                                                : 'bg-background text-foreground border-border hover:border-foreground'
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

                            {/* Description */}
                            {product.description && (
                                <div
                                    className="text-muted-foreground mb-8 leading-relaxed text-sm prose prose-sm max-w-none line-clamp-4"
                                    dangerouslySetInnerHTML={{__html: product.description}}
                                />
                            )}

                            {/* Inquiry Form */}
                            {isSubmitted ? (
                                <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl p-5 text-center space-y-2 mb-4">
                                    <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto" />
                                    <h4 className="font-semibold text-green-800 dark:text-green-200">{t('inquirySuccess')}</h4>
                                    <p className="text-xs text-green-600 dark:text-green-400">{t('inquirySuccessDesc')}</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmitInquiry} className="space-y-3 mb-4">
                                    <h4 className="text-xs font-bold text-muted-foreground tracking-widest uppercase">{t('inquiryTitle')}</h4>
                                    <input
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        required
                                        placeholder={t('inquiryNamePlaceholder')}
                                        className="w-full h-10 rounded-xl border border-border bg-background px-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                                    />
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                            placeholder={t('inquiryEmailPlaceholder')}
                                            className="w-full h-10 rounded-xl border border-border bg-background px-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                                        />
                                        <input
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            placeholder={t('inquiryPhonePlaceholder')}
                                            className="w-full h-10 rounded-xl border border-border bg-background px-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            name="company"
                                            value={formData.company}
                                            onChange={handleInputChange}
                                            placeholder={t('inquiryCompanyPlaceholder')}
                                            className="w-full h-10 rounded-xl border border-border bg-background px-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                                        />
                                        <input
                                            name="quantity"
                                            type="number"
                                            min={1}
                                            value={formData.quantity}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full h-10 rounded-xl border border-border bg-background px-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                                        />
                                    </div>
                                    <textarea
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleInputChange}
                                        rows={2}
                                        placeholder={t('inquiryNotesPlaceholder')}
                                        className="w-full rounded-xl border border-border bg-background px-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                                    />
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-foreground text-background rounded-full py-3.5 font-bold uppercase tracking-widest text-xs hover:bg-muted-foreground transition flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {isSubmitting ? (
                                            <><Loader2 className="w-4 h-4 animate-spin" /> {t('inquirySending')}</>
                                        ) : (
                                            <><Send className="w-4 h-4" /> {t('inquirySubmit')}</>
                                        )}
                                    </button>
                                </form>
                            )}

                            {/* View Detail Link */}
                            <Link
                                href={`/product/${product.slug}`}
                                onClick={onClose}
                                className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition"
                            >
                                {t('viewDetail')} <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
