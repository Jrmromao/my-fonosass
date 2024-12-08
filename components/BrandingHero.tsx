import { Button } from "@/components/ui/button"
import { ArrowRight, Star, Users, Shield, Clock } from 'lucide-react'

export default function BrandingHero() {
    const stats = [
        { label: "Clínicas Parceiras", value: "500+" },
        { label: "Profissionais Ativos", value: "2.000+" },
        { label: "Pacientes Atendidos", value: "50.000+" },
        { label: "Satisfação", value: "4.9/5" }
    ]

    const trustFeatures = [
        {
            icon: Shield,
            title: "100% Seguro",
            description: "Certificado digital e compliance com LGPD"
        },
        {
            icon: Clock,
            title: "Suporte 24/7",
            description: "Atendimento especializado sempre disponível"
        },
        {
            icon: Users,
            title: "Comunidade Ativa",
            description: "Troca de experiências entre profissionais"
        }
    ]

    return (
        <div className="relative bg-white">
            {/* Hero Section */}
            <section className="pt-20 pb-16 bg-gradient-to-b from-purple-50 to-white">
                <div className="container px-4 mx-auto max-w-7xl">
                    <div className="flex flex-col items-center text-center mb-12">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="size-12 bg-indigo-600 rounded-xl flex items-center justify-center">
                                <span className="text-2xl font-bold text-white">TH</span>
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900">thérapie</h1>
                        </div>

                        <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 text-sm font-medium rounded-full mb-4">
              Plataforma Líder em Gestão de Clínicas
            </span>

                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 max-w-3xl">
                            Simplifique a gestão da sua clínica com nossa plataforma completa
                        </h2>

                        <p className="text-xl text-gray-600 mb-8 max-w-2xl">
                            Tudo que você precisa para gerenciar sua clínica em um só lugar.
                            Prontuário eletrônico, agendamento online, telemedicina e muito mais.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 mb-12">
                            <Button
                                className="bg-indigo-600 text-white hover:bg-indigo-700 text-lg px-8"
                            >
                                Começar Agora
                                <ArrowRight className="ml-2 size-5" />
                            </Button>
                            <Button
                                variant="outline"
                                className="border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 text-lg px-8"
                            >
                                Agendar Demo
                            </Button>
                        </div>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl mx-auto">
                            {trustFeatures.map((feature, index) => (
                                <div
                                    key={index}
                                    className="flex flex-col items-center text-center p-6 rounded-xl bg-white shadow-lg hover:shadow-xl transition-shadow"
                                >
                                    <feature.icon className="size-8 text-indigo-600 mb-4" />
                                    <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                                    <p className="text-gray-600 text-sm">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Stats Section */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-t border-gray-200">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="text-3xl font-bold text-indigo-600 mb-2">
                                    {stat.value}
                                </div>
                                <div className="text-sm text-gray-600">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Social Proof */}
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                        <div className="flex">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className="size-4 text-yellow-400 fill-yellow-400" />
                            ))}
                        </div>
                        <span>4.9/5 de avaliação média entre nossos clientes</span>
                    </div>
                </div>
            </section>
        </div>
    )
}