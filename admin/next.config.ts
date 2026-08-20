import type { NextConfig } from "next";

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
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "*.r2.dev" },
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "127.0.0.1" },
      ...storageImagePattern,
    ],
  },
  allowedDevOrigins: ['102.129.168.20']
};

export default nextConfig;
