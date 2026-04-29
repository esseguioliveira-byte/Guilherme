import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for instrumentation.ts (email worker bootstrap)
  experimental: {
    instrumentationHook: true,
  },
};

export default nextConfig;
