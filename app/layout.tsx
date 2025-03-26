import {Inter} from "next/font/google"
import "./globals.css"
import {ClerkProvider} from "@clerk/nextjs";

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
        <ClerkProvider>
            <html lang="pt-BR">
            <body
                className={`${inter.className} flex flex-col min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100`}>
            {children}

            </body>
            </html>
        </ClerkProvider>
    )
}

