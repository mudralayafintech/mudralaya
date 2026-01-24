import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Suppress font optimization warnings during build
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
