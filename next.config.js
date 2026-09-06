/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cache Components: pages are dynamic by default and opt into caching with
  // `use cache`, so routes prerender a static shell and stream the rest.
  cacheComponents: true,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "ik.imagekit.io" }],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
};
module.exports = nextConfig;
