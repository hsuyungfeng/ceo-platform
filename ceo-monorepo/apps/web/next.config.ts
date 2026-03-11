import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    // 指定 Turbopack 根目錄以避免多個 lockfile 警告
    root: __dirname,
  },
};

export default nextConfig;
