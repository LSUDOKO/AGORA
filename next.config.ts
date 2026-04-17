import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization - let Netlify handle it
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
