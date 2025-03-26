"use client"


import React from "react";
import FomosaasLanding from "@/app/fomosaas-landing";

export default function SyntheticV0PageForDeployment() {
    return <FomosaasLanding />
}

// "use client";
//
// import { Button } from "@/components/ui/button";
// import { Card } from "@/components/ui/card";
// import { BookOpen, Users, Award, ArrowRight } from "lucide-react";
// import SVGRender from "@/components/SVGRender";
//
// export default function Home() {
//     return (
//         <main className="min-h-screen bg-background">
//             {/* Hero Section */}
//             <section className="relative gradient-primary section-padding" aria-labelledby="hero-heading">
//                 <div className="container-large">
//                     <div className="grid lg:grid-cols-2 gap-16 items-center">
//                         <div>
//                             <h1 id="hero-heading" className="text-4xl md:text-5xl font-bold text-primary-dark mb-6">
//                                 Marketplace de Exercícios Fonoaudiológicos
//                             </h1>
//                             <p className="text-lg text-primary-dark/90 mb-8">
//                                 Conecte-se com fonoaudiólogos especialistas e acesse exercícios de fonemas selecionados.
//                                 Aprimore sua prática com nossa biblioteca abrangente de recursos fonoaudiológicos.
//                             </p>
//                             <div className="flex flex-col sm:flex-row gap-4">
//                                 <Button
//                                     size="lg"
//                                     className="bg-accent hover:bg-accent-dark text-white transition-colors"
//                                     aria-label="Começar a usar a plataforma"
//                                 >
//                                     Começar Agora
//                                     <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
//                                 </Button>
//                                 <Button
//                                     variant="outline"
//                                     size="lg"
//                                     className="border-accent text-accent hover:bg-accent-light transition-colors"
//                                     aria-label="Explorar exercícios disponíveis"
//                                 >
//                                     Explorar Exercícios
//                                 </Button>
//                             </div>
//                         </div>
//                         <div className="relative">
//                             <div
//                                 className="absolute inset-0 bg-gradient-to-tr from-primary-light/20 to-primary-lighter/10 rounded-[var(--radius)] -rotate-6"
//                                 aria-hidden="true"
//                             ></div>
//                             <Card className="relative bg-surface p-8 md:p-12 rounded-[var(--radius)] shadow-card hover:shadow-card-hover transition-shadow duration-300">
//                                 <div className="aspect-[10/7] w-full relative">
//                                     <SVGRender />
//                                 </div>
//                                 <p className="text-sm text-primary-dark/80 text-center mt-8 font-medium">
//                                     Nossa árvore intuitiva de visualização de fonemas
//                                 </p>
//                             </Card>
//                         </div>
//                     </div>
//                 </div>
//             </section>
//
//             {/* Features Section */}
//             <section className="section-padding bg-surface" aria-labelledby="features-heading">
//                 <div className="container-large">
//                     <h2 id="features-heading" className="text-3xl font-bold text-center mb-16 text-primary-dark">
//                         Por que Escolher Nossa Plataforma?
//                     </h2>
//                     <div className="grid md:grid-cols-3 gap-8">
//                         {[
//                             {
//                                 icon: BookOpen,
//                                 title: "Exercícios Selecionados",
//                                 description: "Acesse exercícios desenvolvidos profissionalmente para cada fonema, organizados em uma árvore de aprendizado intuitiva."
//                             },
//                             {
//                                 icon: Users,
//                                 title: "Comunidade Especializada",
//                                 description: "Conecte-se com fonoaudiólogos qualificados e compartilhe conhecimento dentro da nossa comunidade em crescimento."
//                             },
//                             {
//                                 icon: Award,
//                                 title: "Qualidade Garantida",
//                                 description: "Cada exercício é revisado e verificado por profissionais experientes em fonoaudiologia."
//                             }
//                         ].map((feature, index) => (
//                             <Card
//                                 key={index}
//                                 className="p-8 border-primary-light hover:shadow-card-hover transition-shadow duration-300"
//                             >
//                                 <feature.icon className="h-12 w-12 text-accent mb-4" aria-hidden="true" />
//                                 <h3 className="text-xl font-semibold mb-3 text-primary-dark">{feature.title}</h3>
//                                 <p className="text-primary-dark/80">{feature.description}</p>
//                             </Card>
//                         ))}
//                     </div>
//                 </div>
//             </section>
//
//             {/* CTA Section */}
//             <section className="bg-primary-dark text-primary-light section-padding" aria-labelledby="cta-heading">
//                 <div className="container-large text-center">
//                     <h2 id="cta-heading" className="text-3xl font-bold mb-6">
//                         Pronto para Transformar sua Prática?
//                     </h2>
//                     <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
//                         Junte-se ao nosso marketplace hoje e tenha acesso a uma biblioteca completa de exercícios fonoaudiológicos.
//                     </p>
//                     <Button
//                         size="lg"
//                         className="bg-surface text-primary-dark hover:bg-primary-light transition-colors"
//                         aria-label="Iniciar cadastro na plataforma"
//                     >
//                         Comece sua Jornada
//                         <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
//                     </Button>
//                 </div>
//             </section>
//         </main>
//     );
// }