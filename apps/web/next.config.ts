import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@auriga-money/shared'],
  typedRoutes: true,
  env: {
    SKIP_AUTH: process.env.SKIP_AUTH,
  },
  redirects: async () => [
    { source: '/app', destination: '/app/dashboard', permanent: false },
  ],
};

export default nextConfig;
