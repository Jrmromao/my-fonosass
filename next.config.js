/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fix Turbopack workspace root detection
  turbopack: {
    root: __dirname,
  },

  // Files read with fs at runtime are not traced into the serverless bundle
  // automatically. Activity uploads (server action on /dashboard pages) need
  // the watermark logo and the footer font.
  outputFileTracingIncludes: {
    '/dashboard/**': [
      './public/images/logo-trimmed.png',
      './assets/fonts/Inter-Medium.ttf',
    ],
  },

  // Performance optimizations
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    // Activity uploads go through a server action (default limit 1 MB).
    // Vercel caps request bodies at 4.5 MB, so this is the real ceiling.
    serverActions: { bodySizeLimit: '4mb' },
  },

  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Bundle optimization
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Split chunks for better caching
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          framer: {
            test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
            name: 'framer-motion',
            chunks: 'all',
          },
          clerk: {
            test: /[\\/]node_modules[\\/]@clerk[\\/]/,
            name: 'clerk',
            chunks: 'all',
          },
        },
      };
    }
    return config;
  },

  // Compression
  compress: true,

  // Old URLs
  async redirects() {
    return [
      {
        source: '/dashboard/games',
        destination: '/dashboard/biblioteca',
        permanent: true,
      },
    ];
  },

  // Headers for performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Content-Security-Policy is set per request (with a nonce) in
          // middleware.ts; see lib/security/csp.ts.
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'Permissions-Policy',
            value:
              'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            // API responses depend on the signed-in user (plan, signed S3
            // URLs, CSRF token): never let a browser or CDN share them.
            value: 'private, no-store',
          },
        ],
      },
      {
        source: '/:path*\\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

const { withSentryConfig } = require('@sentry/nextjs/config');

// Sentry: server, edge and (consent-gated) browser error reporting.
// No tunnel route, no replay. The browser posts to the EU ingest host (see CSP).
// Source maps upload only when SENTRY_AUTH_TOKEN is set (Vercel build).
module.exports = withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  telemetry: false,
  sourcemaps: { disable: !process.env.SENTRY_AUTH_TOKEN },
});
