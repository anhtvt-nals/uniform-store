'use client';

import {useState} from 'react';
import {useTranslations} from 'next-intl';
import {Dialog, DialogContent, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import {Drawer, DrawerContent, DrawerHeader, DrawerTitle} from '@/components/ui/drawer';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {CheckCircle2, Loader2, Check} from 'lucide-react';
import {useMediaQuery} from '@/lib/hooks/use-media-query';

interface QuoteRequestModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    source?: string;
}

interface FormState {
    customerName: string;
    phone: string;
    email: string;
    region: string;
    address: string;
    productType: string;
    quantity: string;
}

interface FormErrors {
    [key: string]: string;
}

export function QuoteRequestModal({open, onOpenChange, source}: QuoteRequestModalProps) {
    const t = useTranslations('Home');
    const isDesktop = useMediaQuery('(min-width: 768px)');
    const [form, setForm] = useState<FormState>({
        customerName: '',
        phone: '',
        email: '',
        region: '',
        address: '',
        productType: '',
        quantity: '',
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const validate = (): boolean => {
        const newErrors: FormErrors = {};

        if (!form.customerName.trim()) {
            newErrors.customerName = t('quoteErrRequired');
        }

        const phoneClean = form.phone.replace(/[\s\-.]/g, '');
        if (!phoneClean) {
            newErrors.phone = t('quoteErrRequired');
        } else if (!/^(\+?84|0)\d{7,11}$/.test(phoneClean)) {
            newErrors.phone = t('quoteErrPhone');
        }

        if (form.email.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(form.email.trim())) {
                newErrors.email = t('quoteErrEmail');
            }
        }

        if (form.quantity.trim()) {
            const qty = parseInt(form.quantity, 10);
            if (isNaN(qty) || qty < 1) {
                newErrors.quantity = t('quoteErrQuantity');
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setSubmitting(true);
        try {
            const res = await fetch('/api/v1/quote-requests', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    customerName: form.customerName.trim(),
                    phone: form.phone.trim(),
                    email: form.email.trim(),
                    region: form.region,
                    address: form.address.trim(),
                    productType: form.productType.trim(),
                    quantity: form.quantity ? parseInt(form.quantity, 10) : undefined,
                    source: source || '',
                }),
            });
            const data = await res.json();
            if (!res.ok || data.success === false) {
                throw new Error(data.error?.message || 'Failed');
            }
            setSuccess(true);
        } catch {
            setErrors({submit: t('quoteErrSubmit')});
        } finally {
            setSubmitting(false);
        }
    };

    const handleChange = (field: keyof FormState, value: string) => {
        setForm((prev) => ({...prev, [field]: value}));
        if (errors[field]) {
            setErrors((prev) => {
                const next = {...prev};
                delete next[field];
                return next;
            });
        }
    };

    const handleClose = () => {
        onOpenChange(false);
        setTimeout(() => {
            setForm({customerName: '', phone: '', email: '', region: '', address: '', productType: '', quantity: ''});
            setErrors({});
            setSuccess(false);
        }, 300);
    };

    const formContent = (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
                <Label>{t('quoteName')} <span className="text-red-500">*</span></Label>
                <Input
                    value={form.customerName}
                    onChange={(e) => handleChange('customerName', e.target.value)}
                    placeholder={t('quoteName')}
                />
                {errors.customerName && <p className="text-xs text-red-500">{errors.customerName}</p>}
            </div>

            <div className="grid grid-cols-[3fr_7fr] gap-3">
                <div className="space-y-1.5">
                    <Label>{t('quotePhone')} <span className="text-red-500">*</span></Label>
                    <Input
                        value={form.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        placeholder={t('quotePhone')}
                        type="tel"
                    />
                    {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
                </div>

                <div className="space-y-1.5">
                    <Label>{t('quoteEmail')}</Label>
                    <Input
                        value={form.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder={t('quoteEmail')}
                        type="email"
                    />
                    {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                </div>
            </div>

            <div className="grid grid-cols-[3fr_7fr] gap-3">
                <div className="space-y-1.5">
                    <Label>{t('quoteRegion')}</Label>
                    <Select value={form.region} onValueChange={(v) => handleChange('region', v || '')}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder={t('quoteRegion')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="north">{t('quoteRegionNorth')}</SelectItem>
                            <SelectItem value="central">{t('quoteRegionCentral')}</SelectItem>
                            <SelectItem value="south">{t('quoteRegionSouth')}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-1.5">
                    <Label>{t('quoteAddress')}</Label>
                    <Input
                        value={form.address}
                        onChange={(e) => handleChange('address', e.target.value)}
                        placeholder={t('quoteAddress')}
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <Label>{t('quoteProductType')}</Label>
                <Textarea
                    value={form.productType}
                    onChange={(e) => handleChange('productType', e.target.value)}
                    placeholder={t('quoteProductType')}
                    rows={2}
                />
            </div>

            <div className="space-y-1.5">
                <Label>{t('quoteQuantity')}</Label>
                <Input
                    value={form.quantity}
                    onChange={(e) => handleChange('quantity', e.target.value)}
                    placeholder={t('quoteQuantity')}
                    type="number"
                    min="1"
                />
                {errors.quantity && <p className="text-xs text-red-500">{errors.quantity}</p>}
            </div>

            {errors.submit && (
                <p className="text-xs text-red-500 text-center">{errors.submit}</p>
            )}

            <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t('quoteBtn')}</>
                ) : (
                    t('quoteBtn')
                )}
            </Button>
        </form>
    );

    const successContent = (
        <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-sm text-muted-foreground max-w-sm">{t('quoteSuccess')}</p>
            <Button variant="outline" onClick={handleClose}>{t('nextImage') || 'Close'}</Button>
        </div>
    );

    const titleHeader = (
        <>
            <div className="flex items-center gap-3 mb-1">
                <img src="/logo.jpeg" alt="Minh An Uniform" className="h-8 w-auto object-contain" />
                <div>
                    <DialogTitle className="text-lg sm:text-xl bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                        {t('quoteTitle')}
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground">{t('quoteDesc')}</p>
                </div>
            </div>
        </>
    );

    const trustBadges = (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-1">
            {['standardPrice', 'standardQuality', 'standardService'].map((key) => (
                <div key={key} className="flex items-center gap-1.5 text-xs font-semibold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/40 px-2 py-1.5 rounded-md border border-green-200 dark:border-green-800/50">
                    <div className="w-4 h-4 rounded-full bg-green-600 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-white" />
                    </div>
                    {t(key)}
                </div>
            ))}
        </div>
    );

    if (isDesktop) {
        return (
            <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
                <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="gap-4">
                        {titleHeader}
                        {trustBadges}
                    </DialogHeader>
                    {success ? successContent : formContent}
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Drawer open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
            <DrawerContent className="max-h-[90vh]">
                <DrawerHeader className="text-left gap-4">
            <div className="flex items-center gap-3 mb-1">
                        <img src="/logo.jpeg" alt="Minh An Uniform" className="h-8 w-auto object-contain" />
                        <div>
                            <DrawerTitle className="text-lg sm:text-xl bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                                {t('quoteTitle')}
                            </DrawerTitle>
                            <p className="text-sm text-muted-foreground">{t('quoteDesc')}</p>
                        </div>
                    </div>
                    {trustBadges}
                </DrawerHeader>
                <div className="px-4 pb-8 overflow-y-auto">
                    {success ? successContent : formContent}
                </div>
            </DrawerContent>
        </Drawer>
    );
}
