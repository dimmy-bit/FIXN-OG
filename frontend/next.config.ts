import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use webpack instead of Turbopack for WebAssembly support
  webpack: (config, { isServer }) => {
    // Handle WebAssembly files
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };

    // Handle fhenixjs WebAssembly imports
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    };

    // Add rule for .wasm files - handle fhenixjs WASM imports
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/wasm/[name].[hash][ext]'
      }
    });

    // Handle fhenixjs specific WASM imports
    config.module.rules.push({
      test: /fhenixjs.*\.wasm$/,
      type: 'asset/resource',
      use: {
        loader: 'file-loader',
        options: {
          publicPath: '/_next/static/wasm/',
          outputPath: 'static/wasm/',
        }
      }
    });

    return config;
  },
  
  // Configure transpilation for node_modules
  transpilePackages: ['fhenixjs', 'cofhejs'],
};

export default nextConfig;
