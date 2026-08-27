/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@deskdrop/db", "@deskdrop/validators"],
  images: {
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
};
module.exports = nextConfig;
