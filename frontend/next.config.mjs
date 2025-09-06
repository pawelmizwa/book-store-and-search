/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  experimental: {
    outputFileTracingRoot:
      process.env.NODE_ENV === "production"
        ? "/app"
        : "/Users/pawelmizwa/Own_Projects/book-store-and-search",
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
