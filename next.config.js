/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: "export",
  webpack: (
    config,
    { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }
  ) => {
    return config;
  },
};

module.exports = nextConfig;
