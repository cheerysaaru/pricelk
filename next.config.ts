import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

// Local verification: build with ASSET_PREFIX=http://localhost:8090/pricelk/ so
// the static export loads its own JS chunks instead of the live site's.
const assetPrefix =
  process.env.ASSET_PREFIX ?? (isProd ? "https://cheerysaaru.github.io/pricelk/" : undefined);

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: isProd ? "/pricelk" : undefined,
  assetPrefix,
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
      { protocol: "https", hostname: "buyabans.com" },
      { protocol: "https", hostname: "acecomlanka.lk" },
      { protocol: "https", hostname: "www.pc.lk" },
      { protocol: "https", hostname: "computercare.lk" },
      { protocol: "https", hostname: "cdn.shopify.com" },
      { protocol: "https", hostname: "www.redlinetech.lk" },
      { protocol: "https", hostname: "www.nanotek.lk" },
      { protocol: "https", hostname: "www.gamestreet.lk" },
      { protocol: "https", hostname: "www.mcentre.lk" },
      { protocol: "https", hostname: "www.lapshop.lk" },
      { protocol: "https", hostname: "singerwebcdn.azureedge.net" },
      { protocol: "https", hostname: "www.singersl.com" },
      { protocol: "https", hostname: "www.winsoft.lk" },
      { protocol: "https", hostname: "cdn.sanity.io" },
    ],
  },
};

export default nextConfig;