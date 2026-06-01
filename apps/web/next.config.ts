import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@atlas-bank/shared'],
  typedRoutes: true,
};

export default nextConfig;
