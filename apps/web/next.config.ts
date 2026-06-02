import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@atlas-bank/shared'],
  typedRoutes: true,
  env: {
    SKIP_AUTH: process.env.SKIP_AUTH,
  },
  redirects: async () => [
    { source: '/app', destination: '/app/dashboard', permanent: false },
  ],
};

export default nextConfig;
