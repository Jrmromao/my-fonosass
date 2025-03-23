import type { NextConfig } from 'next';

const config: NextConfig = {
    // Enable production source maps for better debugging with smaller sizes
    productionBrowserSourceMaps: true,

    // Optimize images
    images: {
        minimumCacheTTL: 60,
    },

    // Add compression
    compress: true,

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
};

export default config;