import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable Turbopack for Vercel compatibility
  webpack: (config, { isServer }) => {
    // Handle WebAssembly files
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    // Handle fhenixjs WebAssembly imports
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
      '@react-native-async-storage/async-storage': false,
    };

    // Add rule for .wasm files
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/wasm/[name].[hash][ext]'
      }
    });

    // Ignore circular dependency warnings
    config.ignoreWarnings = [
      {
        module: /node_modules\/@metamask\/sdk/,
        message: /Can't resolve '@react-native-async-storage\/async-storage'/,
      },
      {
        message: /Circular dependency between chunks/,
      },
    ];

    return config;
  },
  
  // Configure transpilation for node_modules
  transpilePackages: ['fhenixjs', 'cofhejs'],
};

export default nextConfig;
