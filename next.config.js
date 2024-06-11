/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: "export",
  webpack: (
    config,
    { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }
  ) => {
    return config;
  },
  reactStrictMode: false,
};

module.exports = nextConfig;
