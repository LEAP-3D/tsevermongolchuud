import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Move turbo OUT of experimental and to the top level

  experimental: {
    // other experimental features like 'ppr' or 'taint' go here
  },
  env: {
    DATABASE_URL: process.env.DATABASE_URL || "",
  },
};

export default nextConfig;
