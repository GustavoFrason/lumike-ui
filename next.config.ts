// next.config.ts
// Propósito: configuração global do Next (React Compiler + imagens Supabase)

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactCompiler: true, // Next 16: flag na raiz
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' }, // Supabase Storage
    ],
  },
};

export default nextConfig;