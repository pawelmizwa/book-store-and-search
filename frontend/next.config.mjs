/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: "standalone",
  experimental: {
    outputFileTracingRoot: undefined,
  },
  webpack: (config, { defaultLoaders }) => {
    config.module.rules.push({
      test: /\.tsx?$/,
      use: [defaultLoaders.babel],
      exclude: /node_modules/,
    });
    return config;
  },
};

export default nextConfig;
