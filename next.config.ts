import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      // e.g. allow up to 20 MB
      bodySizeLimit: "20mb",
    },
  },
};

export default nextConfig;
