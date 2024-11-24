import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export default function CTASection() {
  return (
    <section className="py-20 md:py-32 bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <h2 className="text-4xl font-bold sm:text-5xl md:text-6xl">
            Pronto para Transformar sua Prática?
          </h2>
          <p className="max-w-[600px] text-xl text-indigo-100">
            Junte-se a centenas de fonoaudiólogos que já estão revolucionando seu trabalho com o FonoSaaS.
          </p>
          <Button className="bg-white text-indigo-600 hover:bg-indigo-100 text-lg px-8 py-6 rounded-full shadow-xl hover:shadow-indigo-500/50 transition-all duration-300 transform hover:-translate-y-1">
            Comece seu Teste Gratuito <ArrowRight className="ml-2 size-5" />
          </Button>
        </div>
      </div>
    </section>
  )
}