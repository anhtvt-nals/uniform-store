import {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const storageImagePattern = (() => {
    const storageUrl = process.env.NEXT_PUBLIC_STORAGE_URL;
    if (!storageUrl) return [];

    try {
        return [new URL(`${storageUrl.replace(/\/+$/, '')}/**`)];
    } catch {
        return [];
    }
})();

const nextConfig: NextConfig = {
    cacheComponents: true,
    images: {
        // This is necessary to display images from your local Vendure instance
        dangerouslyAllowLocalIP: true,
        remotePatterns: [
            {
                hostname: 'readonlydemo.vendure.io',
            },
            {
                hostname: 'demo.vendure.io'
            },
            {
                hostname: 'localhost'
            },
            // S3 / S3-compatible object storage (assets served from S3)
            {
                hostname: '*.s3.amazonaws.com',
            },
            {
                hostname: '*.s3.*.amazonaws.com',
            },
            {
                hostname: 's3.amazonaws.com',
            },
            // Cloudflare R2 public development domains and configured custom domain
            {
                protocol: 'https',
                hostname: '*.r2.dev',
            },
            ...storageImagePattern,
            // Marketing visuals (hero/gallery/news) sourced from Unsplash
            {
                hostname: 'images.unsplash.com',
            },
        ],
    },
    experimental: {
        rootParams: true
    },
    allowedDevOrigins: ['102.129.168.20']
};

export default withNextIntl(nextConfig);
