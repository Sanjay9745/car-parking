import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  //ignore eslint
  eslint: {
    ignoreDuringBuilds: true,
  },
  //ignore typescript
  typescript: {
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
