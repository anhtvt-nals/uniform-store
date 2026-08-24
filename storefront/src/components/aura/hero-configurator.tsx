'use client';

import { useEffect, useMemo, useState } from 'react';
import { Calculator, CheckCircle2 } from 'lucide-react';
import { QuoteButton } from '@/components/commerce/quote-button';

const quantities = ['20', '50', '100', '200', '500+'];
const designOptions = ['Đã có logo', 'Chưa có thiết kế'];
const timelines = ['7 ngày', '14 ngày', '30 ngày'];

function ChoiceGroup({ label, options, value, onChange, columns = 'grid-cols-2' }: { label: string; options: string[]; value: string; onChange: (value: string) => void; columns?: string }) {
  return (
    <div>
      <p className="mb-1.5 text-[11px] font-bold text-primary-foreground/75">{label}</p>
      <div className={`grid gap-2 ${columns}`}>
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`rounded-md border px-1.5 py-1.5 text-center text-[11px] font-semibold transition ${value === option ? 'border-primary-foreground bg-primary-foreground text-primary shadow-sm' : 'border-primary-foreground/15 bg-primary-foreground/[0.08] text-primary-foreground hover:bg-primary-foreground/15'}`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

export function HeroConfigurator({categories}: {categories: Array<{id: string; name: string; slug: string}>}) {
  const [quantity, setQuantity] = useState('100');
  const [uniformType, setUniformType] = useState(categories[0]?.name ?? 'Đồng phục');
  const [design, setDesign] = useState('Đã có logo');
  const [timeline, setTimeline] = useState('14 ngày');
  const selectedCategory = categories.find((category) => category.name === uniformType) ?? categories[0];
  const numericQuantity = quantity === '500+' ? 500 : Number(quantity);
  const [estimate, setEstimate] = useState<{min: number | null; max: number | null} | null>(null);
  const [estimating, setEstimating] = useState(false);
  useEffect(() => {
    if (!selectedCategory) return;
    const controller = new AbortController();
    setEstimating(true);
    fetch(`/api/v1/products/price-estimate?categorySlug=${encodeURIComponent(selectedCategory.slug)}&quantity=${numericQuantity}`, {signal: controller.signal})
      .then((response) => response.json())
      .then((payload) => setEstimate(payload?.success ? payload.data : null))
      .catch(() => { if (!controller.signal.aborted) setEstimate(null); })
      .finally(() => { if (!controller.signal.aborted) setEstimating(false); });
    return () => controller.abort();
  }, [selectedCategory?.slug, numericQuantity]);
  const estimateText = useMemo(() => {
    if (!estimate || estimate.min === null || estimate.max === null) return 'Liên hệ để báo giá';
    const format = (value: number) => `${new Intl.NumberFormat('vi-VN').format(value)}đ`;
    return estimate.min === estimate.max ? format(estimate.min) : `${format(estimate.min)} – ${format(estimate.max)}`;
  }, [estimate]);
  const productType = `Configurator: ${uniformType}; ${design}; cần hàng ${timeline}.`;

  return (
    <aside className="md:col-span-12 lg:col-span-4 flex h-full flex-col rounded-[28px] bg-primary p-4 text-primary-foreground shadow-lg sm:p-5">
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/15"><Calculator className="h-4 w-4" /></div>
        <div><p className="text-base font-bold leading-tight">Báo giá đồng phục</p><p className="mt-0.5 text-[11px] text-primary-foreground/70">Chọn nhu cầu để xem mức giá tham khảo.</p></div>
      </div>
      <div className="space-y-4">
        <ChoiceGroup label="1. Bạn cần bao nhiêu áo?" options={quantities} value={quantity} onChange={setQuantity} columns="grid-cols-5" />
        <div>
          <p className="mb-1.5 text-[11px] font-bold text-primary-foreground/75">2. Loại đồng phục?</p>
          <select value={uniformType} onChange={(event) => setUniformType(event.target.value)} className="h-9 w-full rounded-md border border-primary-foreground/15 bg-primary-foreground/[0.08] px-3 text-[11px] font-semibold text-primary-foreground outline-none transition focus:border-primary-foreground/60">
            {categories.map((category) => <option key={category.id} value={category.name} className="text-foreground">{category.name}</option>)}
          </select>
        </div>
        <ChoiceGroup label="3. Thiết kế?" options={designOptions} value={design} onChange={setDesign} />
        <ChoiceGroup label="4. Khi cần hàng?" options={timelines} value={timeline} onChange={setTimeline} columns="grid-cols-3" />
      </div>
      <div className="mt-4 rounded-xl border border-primary-foreground/15 bg-primary-foreground/[0.1] px-3 py-4 lg:mt-auto">
        <div className="flex items-center justify-between gap-2"><p className="leading-none text-[10px] font-bold uppercase tracking-widest text-primary-foreground/70">Giá tham khảo</p><p className="leading-none text-lg font-black tracking-tight">{estimating ? 'Đang tính...' : estimateText}<span className="ml-1 text-[11px] font-semibold">{estimate?.min != null && estimate?.max != null ? '/ áo' : ''}</span></p></div>
      </div>
      <div className="mt-3"><QuoteButton variant="hero" compact prefill={{ productType, quantity }} /></div>
      <p className="mt-2 flex items-center justify-center gap-1.5 text-[10px] text-primary-foreground/70"><CheckCircle2 className="h-3.5 w-3.5 text-green-300" /> Tư vấn và thiết kế mẫu miễn phí</p>
    </aside>
  );
}
