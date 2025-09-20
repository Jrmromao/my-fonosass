import type { NextConfig } from 'next';

const config: NextConfig = {
    // Enable production source maps for better debugging with smaller sizes
    productionBrowserSourceMaps: true,

    // Optimize images
    images: {
        minimumCacheTTL: 60,
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'img.clerk.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'images.clerk.dev',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'www.gravatar.com',
                port: '',
                pathname: '/**',
            },
        ],
    },

    // Add compression
    compress: true,

    // Increase the body size limit for Server Actions (if using App Router)
    // Adjust the limit as needed for your file sizes
    experimental: {
        serverActions: {
            bodySizeLimit: '25mb', // Example limit, change to suit your needs
        },
    },

    // Advanced webpack optimizations if needed
    webpack: (config, { dev, isServer }) => {
        // Optimize only in production builds
        if (!dev && !isServer) {
            // Add specific optimizations here if needed
        }

        // Add SVG optimization with SVGO
        config.module.rules.push({
            test: /\.svg$/,
            use: [{
                loader: '@svgr/webpack',
                options: {
                    svgoConfig: {
                        plugins: [
                            {
                                name: 'preset-default',
                                params: {
                                    overrides: {
                                        // Keep viewBox attribute to maintain aspect ratio
                                        removeViewBox: false,
                                        // Remove unnecessary decimal precision
                                        cleanupNumericValues: {
                                            floatPrecision: 1
                                        },
                                        // Enable path merging to reduce number of elements
                                        mergePaths: true,
                                        // Remove empty elements/attributes
                                        removeEmptyAttrs: true,
                                        removeEmptyContainers: true,
                                        // Remove hidden elements
                                        removeHiddenElems: true,
                                        // Collapse groups
                                        collapseGroups: true
                                    }
                                }
                            }
                        ]
                    }
                }
            }]
        });

        return config;
    },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://clerk.accounts.dev https://*.clerk.accounts.dev https://clerk.almanaquedafala.com.br https://www.googletagmanager.com https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https: blob:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https: wss: https://clerk.accounts.dev https://*.clerk.accounts.dev https://clerk.almanaquedafala.com.br https://va.vercel-scripts.com; frame-src 'self' https://clerk.accounts.dev https://*.clerk.accounts.dev https://clerk.almanaquedafala.com.br; frame-ancestors 'none'; base-uri 'self'; form-action 'self';",
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default config;