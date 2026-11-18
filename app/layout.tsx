import GoogleAnalytics from '@/components/GoogleAnalytics';
import AnalyticsConsentBanner from '@/components/cookies/AnalyticsConsentBanner';
import { Providers } from '@/components/Providers';
import AccessibilityAudit from '@/components/accessibility/AccessibilityAudit';
import WebVitals from '@/components/analytics/WebVitals';
import WebVitalsDashboard from '@/components/analytics/WebVitalsDashboard';
import StructuredData from '@/components/seo/StructuredData';
import { ptBR } from '@clerk/localizations';
import { ClerkProvider } from '@clerk/nextjs';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import localFont from 'next/font/local';
import './globals.css';

// Self-hosted (app/fonts, latin subset, variable weight; both SIL OFL).
// next/font/google downloads from Google at build time, and a bad response
// from Google failed a production build. Local files make builds offline.
const inter = localFont({
  src: './fonts/inter-latin-variable.woff2',
  weight: '300 700',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
  variable: '--font-inter',
});

const nunito = localFont({
  src: './fonts/nunito-latin-variable.woff2',
  weight: '400 800',
  display: 'swap',
  fallback: ['system-ui', 'arial'],
  variable: '--font-nunito',
});

export const metadata = {
  title: {
    default: 'Almanaque da Fala | Atividades de fonoaudiologia por fonema',
    template: '%s | Almanaque da Fala',
  },
  description:
    'Biblioteca de atividades imprimíveis para fonoaudiólogos que atendem crianças. Organizadas por fonema, faixa etária e dificuldade, criadas e revisadas por fonoaudióloga.',
  keywords: [
    'fonoaudiologia',
    'fonoaudiólogo',
    'atividades fonoaudiologia',
    'exercícios por fonema',
    'exercícios fonoaudiológicos',
    'terapia da fala',
    'Brasil',
    'LGPD',
    'CFFa',
  ],
  authors: [{ name: 'Almanaque da Fala Team' }],
  creator: 'Almanaque da Fala',
  publisher: 'Almanaque da Fala',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://www.almanaquedafala.com.br'),
  alternates: {
    canonical: 'https://www.almanaquedafala.com.br',
    languages: {
      'pt-BR': 'https://www.almanaquedafala.com.br',
      pt: 'https://www.almanaquedafala.com.br', // Fallback for Portuguese
    },
  },
  openGraph: {
    title: 'Almanaque da Fala | Atividades de fonoaudiologia por fonema',
    description:
      'Atividades imprimíveis para fonoaudiólogos que atendem crianças, organizadas por fonema e faixa etária.',
    url: 'https://www.almanaquedafala.com.br',
    siteName: 'Almanaque da Fala',
    locale: 'pt_BR',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Almanaque da Fala - Plataforma para Fonoaudiólogos',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Almanaque da Fala | Atividades de fonoaudiologia por fonema',
    description:
      'Atividades imprimíveis para fonoaudiólogos que atendem crianças, organizadas por fonema e faixa etária.',
    images: ['/og-image.png'],
    creator: '@almanaquedafala',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  category: 'healthcare',
  classification: 'Fonoaudiologia',
  referrer: 'origin-when-cross-origin',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider localization={ptBR}>
      <html lang="pt-BR" suppressHydrationWarning>
        <head>
          {/* DNS prefetch for external domains */}
          <link rel="dns-prefetch" href="//va.vercel-scripts.com" />
          <link rel="dns-prefetch" href="//clerk.accounts.dev" />

          {/* Preconnect to external domains */}
          <link rel="preconnect" href="https://va.vercel-scripts.com" />
          <link rel="preconnect" href="https://clerk.accounts.dev" />

          <link rel="manifest" href="/manifest.json" />
          <meta name="theme-color" content="#6366f1" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta
            name="apple-mobile-web-app-status-bar-style"
            content="default"
          />
          <meta name="apple-mobile-web-app-title" content="Almanaque da Fala" />
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

          {/* Google Site Verification */}
          <meta
            name="google-site-verification"
            content="ndrWlg9lGtzJgG4xtDqU0dX0E-nqW-QvHwW2uPfPSeY"
          />

          {/* Additional SEO Meta Tags */}
          <meta name="language" content="pt-BR" />
          <meta name="geo.region" content="BR" />
          <meta name="geo.country" content="Brazil" />
          <meta name="distribution" content="global" />
          <meta name="rating" content="general" />
          <meta name="revisit-after" content="1 days" />
          <meta
            name="robots"
            content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
          />

          {/* Structured Data for Better SEO */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'SoftwareApplication',
                name: 'Almanaque da Fala',
                description:
                  'Atividades imprimíveis de fonoaudiologia infantil, organizadas por fonema',
                url: 'https://www.almanaquedafala.com.br',
                applicationCategory: 'HealthApplication',
                operatingSystem: 'Web',
                offers: {
                  '@type': 'Offer',
                  price: '0',
                  priceCurrency: 'BRL',
                },
                provider: {
                  '@type': 'Organization',
                  name: 'Almanaque da Fala',
                  url: 'https://www.almanaquedafala.com.br',
                },
              }),
            }}
          />
        </head>
        <body
          className={`${inter.variable} ${nunito.variable} font-sans flex flex-col min-h-screen bg-white`}
          suppressHydrationWarning={true}
        >
          {/* Skip to main content link for accessibility */}
          <a href="#main-content" className="skip-link">
            Pular para o conteúdo principal
          </a>

          {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
            <>
              <GoogleAnalytics
                GA_MEASUREMENT_ID={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}
              />
              <AnalyticsConsentBanner />
            </>
          )}
          <Providers>
            <StructuredData type="website" />
            {children}
            <Analytics />
          </Providers>
          <SpeedInsights />

          <WebVitals
            analyticsId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}
            debug={process.env.NODE_ENV === 'development'}
          />

          {/* <PerformanceMonitor /> */}
        </body>
      </html>
    </ClerkProvider>
  );
}
