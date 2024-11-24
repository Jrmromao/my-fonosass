import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Phone } from 'lucide-react'

export default function HeroSection() {
  return (
    <section className="py-20 md:py-32 overflow-hidden">
      <div className="container px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 leading-[1.1]">
              Revolucione suas Terapias
            </h1>
            <p className="text-xl text-gray-600 max-w-[600px]">
              Gerencie pacientes e prontuários em uma plataforma intuitiva. 
              Eleve sua prática ao próximo nível.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="bg-indigo-600 text-white hover:bg-indigo-700 text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-indigo-200 transition-all duration-300 transform hover:-translate-y-1">
                Comece Gratuitamente
              </Button>
              <Button variant="outline" className="text-indigo-600 border-indigo-600 hover:bg-indigo-50 text-lg px-8 py-6 rounded-full transition-all duration-300">
                Agende uma Demo
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-3xl transform rotate-3 scale-105 opacity-20 blur-2xl"></div>
            <Image
              src="/images/hero.png"
              alt="Dashboard FonoSaaS"
              width={600}
              height={600}
              className="relative rounded-3xl shadow-2xl border-8 border-white"
            />
            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl">
              <div className="flex items-center gap-2 text-indigo-600">
                <Phone className="size-5" />
                <span className="font-semibold">Suporte 24/7</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}