'use client';

import {useState, useCallback, useEffect} from 'react';
import {Eye, ChevronLeft, ChevronRight} from 'lucide-react';
import {useTranslations} from 'next-intl';
import {Dialog, DialogContent, DialogTitle} from '@/components/ui/dialog';

export type GalleryImage = {
    src: string;
    alt: string;
};

export function ProductionGalleryClient({images}: {images: GalleryImage[]}) {
    const t = useTranslations('Home');
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(0);

    const show = useCallback((i: number) => {
        setActive(i);
        setOpen(true);
    }, []);

    const next = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setActive((i) => (i + 1) % images.length);
    }, [images.length]);

    const prev = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setActive((i) => (i - 1 + images.length) % images.length);
    }, [images.length]);

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false);
            if (e.key === 'ArrowRight') setActive((i) => (i + 1) % images.length);
            if (e.key === 'ArrowLeft') setActive((i) => (i - 1 + images.length) % images.length);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, images.length]);

    const current = images[active];

    return (
        <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {images.map((img, i) => (
                    <button
                        key={i}
                        type="button"
                        onClick={() => show(i)}
                        className="group relative rounded-2xl overflow-hidden bg-muted aspect-[4/5] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        aria-label={t('viewImage')}
                    >
                        <img
                            src={img.src}
                            alt={img.alt}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                        <div className="absolute inset-0 bg-foreground/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                            <Eye className="w-6 h-6 text-background" />
                        </div>
                    </button>
                ))}
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-5xl w-[95vw] p-0 overflow-hidden bg-black/95 border-none">
                    <DialogTitle className="sr-only">{current?.alt}</DialogTitle>
                    <div className="relative flex items-center justify-center">
                        <img
                            src={current?.src}
                            alt={current?.alt}
                            className="max-h-[85vh] w-auto object-contain"
                        />

                        {images.length > 1 && (
                            <>
                                <button
                                    type="button"
                                    onClick={prev}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 size-10 rounded-full bg-background/80 hover:bg-background text-foreground flex items-center justify-center transition"
                                    aria-label={t('prevImage')}
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={next}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 size-10 rounded-full bg-background/80 hover:bg-background text-foreground flex items-center justify-center transition"
                                    aria-label={t('nextImage')}
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </>
                        )}

                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-background/80 text-foreground text-xs font-medium">
                            {active + 1} / {images.length}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
