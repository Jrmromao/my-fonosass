import {Inter} from "next/font/google"
import "./globals.css"
import {ClerkProvider} from "@clerk/nextjs";
import { ptBR } from '@clerk/localizations'
import { SpeedInsights } from '@vercel/speed-insights/next';
import {Providers} from "@/components/Providers";
import { Analytics } from "@vercel/analytics/next"
import GoogleAnalytics from "@/components/GoogleAnalytics"
import ConsentManagerWrapper from "@/components/legal/ConsentManagerWrapper"
import StructuredData from "@/components/seo/StructuredData"

const inter = Inter({subsets: ["latin"]})

export const metadata = {
    title: {
        default: "FonoSaaS - Solução Completa para Fonoaudiólogos",
        template: "%s | FonoSaaS"
    },
    description: "Plataforma SaaS completa para fonoaudiólogos brasileiros. Gerencie pacientes, agendamentos, prontuários e exercícios terapêuticos em conformidade com LGPD e CFFa.",
    keywords: ["fonoaudiologia", "fonoaudiólogo", "SaaS", "prontuários", "exercícios fonoaudiológicos", "terapia da fala", "Brasil", "LGPD", "CFFa"],
    authors: [{ name: "FonoSaaS Team" }],
    creator: "FonoSaaS",
    publisher: "FonoSaaS",
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    metadataBase: new URL('https://almanaquedafala.com.br'),
    alternates: {
        canonical: '/',
        languages: {
            'pt-BR': '/',
        },
    },
    openGraph: {
        title: "FonoSaaS - Solução Completa para Fonoaudiólogos",
        description: "Plataforma SaaS completa para fonoaudiólogos brasileiros. Gerencie pacientes, agendamentos, prontuários e exercícios terapêuticos.",
        url: 'https://almanaquedafala.com.br',
        siteName: 'FonoSaaS',
        locale: 'pt_BR',
        type: 'website',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'FonoSaaS - Plataforma para Fonoaudiólogos',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: "FonoSaaS - Solução Completa para Fonoaudiólogos",
        description: "Plataforma SaaS completa para fonoaudiólogos brasileiros. Gerencie pacientes, agendamentos e prontuários.",
        images: ['/og-image.png'],
        creator: '@fonosass',
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
}

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <ClerkProvider localization={ptBR}>
            <html lang="pt-BR">
            <head>
                <link rel="manifest" href="/manifest.json" />
                <meta name="theme-color" content="#6366f1" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="default" />
                <meta name="apple-mobile-web-app-title" content="FonoSaaS" />
                <link rel="apple-touch-icon" href="/logo.png" />
            </head>
            <body
                className={`${inter.className} flex flex-col min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100`}
                suppressHydrationWarning={true}>
            {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
                <GoogleAnalytics GA_MEASUREMENT_ID={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
            )}
            <Providers>
                <StructuredData type="website" />
                {children}
                <Analytics />
            </Providers>
            <ConsentManagerWrapper />
            <SpeedInsights />
            </body>
            </html>
        </ClerkProvider>
    )
}