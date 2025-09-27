/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; media-src 'self' blob: data:; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.clerk.accounts.dev https://www.googletagmanager.com https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; connect-src 'self' https://api.openai.com https://texttospeech.googleapis.com https://*.clerk.accounts.dev; frame-src 'self' https://*.clerk.accounts.dev;",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
