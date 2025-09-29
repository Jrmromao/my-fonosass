import GoogleAnalytics from '@/components/GoogleAnalytics';
import { Providers } from '@/components/Providers';
import WebVitalsTracker from '@/components/WebVitalsTracker';
import StructuredData from '@/components/seo/StructuredData';
import { ptBR } from '@clerk/localizations';
import { ClerkProvider } from '@clerk/nextjs';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
});

export const metadata = {
  title: {
    default: 'Almanaque da Fala - Solução Completa para Fonoaudiólogos',
    template: '%s | Almanaque da Fala',
  },
  description:
    'Plataforma SaaS completa para fonoaudiólogos brasileiros. Gerencie pacientes, agendamentos, prontuários e exercícios terapêuticos em conformidade com LGPD e CFFa.',
  keywords: [
    'fonoaudiologia',
    'fonoaudiólogo',
    'SaaS',
    'prontuários',
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
    title: 'Almanaque da Fala - Solução Completa para Fonoaudiólogos',
    description:
      'Plataforma SaaS completa para fonoaudiólogos brasileiros. Gerencie pacientes, agendamentos, prontuários e exercícios terapêuticos.',
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
    title: 'Almanaque da Fala - Solução Completa para Fonoaudiólogos',
    description:
      'Plataforma SaaS completa para fonoaudiólogos brasileiros. Gerencie pacientes, agendamentos e prontuários.',
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
  classification: 'Speech Therapy Software',
  referrer: 'origin-when-cross-origin',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider localization={ptBR}>
      <html lang="pt-BR">
        <head>
          <link rel="manifest" href="/manifest.json" />
          <meta name="theme-color" content="#6366f1" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta
            name="apple-mobile-web-app-status-bar-style"
            content="default"
          />
          <meta name="apple-mobile-web-app-title" content="Almanaque da Fala" />
          <link rel="apple-touch-icon" href="/logo.png" />

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
                  'Plataforma SaaS completa para fonoaudiólogos brasileiros',
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
          className={`${inter.className} flex flex-col min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100`}
          suppressHydrationWarning={true}
        >
          {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
            <GoogleAnalytics
              GA_MEASUREMENT_ID={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}
            />
          )}
          <Providers>
            <StructuredData type="website" />
            {children}
            <Analytics />
          </Providers>
          <SpeedInsights />
          <WebVitalsTracker />
        </body>
      </html>
    </ClerkProvider>
  );
}
