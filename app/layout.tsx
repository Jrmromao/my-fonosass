import { Inter } from "next/font/google"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

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
    <html lang="pt-BR">
      <body className={`${inter.className} flex flex-col min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100`}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  )
}