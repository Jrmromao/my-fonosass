import {Inter} from "next/font/google"
import "./globals.css"
import {ClerkProvider} from "@clerk/nextjs";
import { ptBR } from '@clerk/localizations'
import { SpeedInsights } from '@vercel/speed-insights/next';
import {Providers} from "@/components/Providers";
import { Analytics } from "@vercel/analytics/next"
import GoogleAnalytics from "@/components/GoogleAnalytics"
import ConsentManager from "@/components/legal/ConsentManager"

const inter = Inter({subsets: ["latin"]})

export const metadata = {
    title: "FonoSaaS - Solução Completa para Fonoaudiólogos",
    description: "Gerencie pacientes, agendamentos e prontuários em um só lugar. A solução completa para fonoaudiólogos empreendedores.",
}

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <ClerkProvider localization={ptBR}>
            <html lang="pt-BR">
            <body
                className={`${inter.className} flex flex-col min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100`}
                suppressHydrationWarning={true}>
            {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
                <GoogleAnalytics GA_MEASUREMENT_ID={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
            )}
            <Providers>
                {children}
                <Analytics />
            </Providers>
            <ConsentManager onConsentChange={(preferences) => {
                // Handle consent preferences
                console.log('Consent preferences:', preferences);
            }} />
            <SpeedInsights />
            </body>
            </html>
        </ClerkProvider>
    )
}