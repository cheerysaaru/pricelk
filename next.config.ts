import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: isProd ? "/pricelk" : undefined,
  assetPrefix: isProd ? "https://cheerysaaru.github.io/pricelk/" : undefined,
  turbopack: {
    root: __dirname,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "cdn.takas.lk" },
      { protocol: "https", hostname: "www.wasi.lk" },
      { protocol: "https", hostname: "wasi.lk" },
      { protocol: "https", hostname: "idealz.lk" },
    ],
  },
};

export default nextConfig;