import { Button } from "@/components/ui/button"
import { Check, Play } from "lucide-react"
import { aboutItems } from "@/lib/constants/content"
import Image from "next/image"

export default function AboutSection() {
  return (
    <section id="sobre" className="py-20 md:py-32 bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="container px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              Sobre o FonoSaaS
            </h2>
            <p className="text-xl text-gray-600">
              Desenvolvido por fonoaudiólogos para fonoaudiólogos, o FonoSaaS é a solução definitiva 
              para modernizar e expandir sua prática clínica.
            </p>
            <ul className="space-y-4">
              {aboutItems.map((item, index) => (
                <li key={index} className="flex items-center gap-3">
                  <div className="flex-shrink-0 size-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    <Check className="size-4" />
                  </div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Button className="bg-indigo-600 text-white hover:bg-indigo-700 mt-4 shadow-lg hover:shadow-indigo-200 transition-all duration-300">
              Conheça Nossa História
            </Button>
          </div>
          <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl">
            <Image
              src="/api/placeholder/600/400"
              alt="Equipe FonoSaaS"
              width={600}
              height={400}
              className="object-cover w-full h-full"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <Button variant="outline" className="text-white border-white hover:bg-white/20 rounded-full px-6 py-3">
                <Play className="mr-2 size-5" /> Assista ao Vídeo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}