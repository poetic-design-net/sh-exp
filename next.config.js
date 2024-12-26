/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.NODE_ENV === 'development' ? undefined : 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.firebasestorage.app',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.storage.googleapis.com',
        pathname: '/**',
      }
    ],
    formats: ['image/webp'],
    deviceSizes: [400, 800, 1200],
    imageSizes: [],
    minimumCacheTTL: 31536000,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async headers() {
    if (process.env.NODE_ENV === 'development') {
      return [];
    }
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow'
          },
          {
            key: 'WWW-Authenticate',
            value: 'Basic realm="Restricted Site"'
          }
        ],
      },
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          }
        ]
      },
      {
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          }
        ]
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, stale-while-revalidate=60',
          }
        ]
      },
      {
        source: '/((?!api/|_next/|static/|fonts/).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, stale-while-revalidate=60',
          }
        ]
      }
    ];
  },
  experimental: {
    serverComponentsExternalPackages: [
      'firebase-admin',
      'monero-ts',
      '@google-cloud/firestore',
      '@fastify/busboy',
      'protobufjs',
      '@protobufjs/codegen',
      '@protobufjs/inquire',
      'lodash.clonedeep',
      'sharp'
    ]
  },
  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        zlib: require.resolve('browserify-zlib'),
        path: require.resolve('path-browserify'),
        os: require.resolve('os-browserify/browser'),
        util: require.resolve('util/'),
        buffer: require.resolve('buffer/'),
        'node:stream': require.resolve('stream-browserify'),
        'node:crypto': require.resolve('crypto-browserify'),
        'node:buffer': require.resolve('buffer/'),
        'node:util': require.resolve('util/'),
        'node:path': require.resolve('path-browserify'),
        'node:fs': false,
        'node:os': require.resolve('os-browserify/browser')
      };

      config.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
        })
      );

      config.plugins.push(
        new webpack.ProvidePlugin({
          process: 'process/browser',
        })
      );

      config.module.rules.push({
        test: /monero-ts|firebase-admin|@google-cloud\/firestore|@fastify\/busboy|sharp/,
        use: 'null-loader'
      });
    }

    if (process.env.NODE_ENV === 'development') {
      // Faster builds in development
      config.devtool = 'eval-source-map';
      
      // Optimize development performance
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
      };
      
      // Exclude large libraries from hot reloading
      config.watchOptions = {
        ...config.watchOptions,
        ignored: ['**/node_modules', '**/.git'],
      };
    }

    return config;
  },
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/admin/:path*',
          destination: '/admin/:path*',
        },
        {
          source: '/login',
          destination: '/login',
        },
        {
          source: '/cart',
          destination: '/cart',
        },
      ],
    };
  },
};

module.exports = nextConfig;
