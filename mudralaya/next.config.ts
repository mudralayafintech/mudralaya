import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // @ts-ignore - Turbopack root configuration
    turbo: {
      root: "..",
    },
  },
};

export default nextConfig;
