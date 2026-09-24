/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@solana/wallet-adapter-base',
    '@solana/wallet-adapter-react',
  ],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        os: false,
        path: false,
        crypto: false,
      };
    }
    // Silence pino-pretty missing module (transitive dep, not needed in browser)
    config.resolve.alias = {
      ...config.resolve.alias,
      'pino-pretty': false,
    };
    return config;
  },
};

export default nextConfig;
