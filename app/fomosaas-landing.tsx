'use client';

import { motion } from 'framer-motion';
import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  Mic,
  Music,
  Play,
  Star,
  Volume2,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
// import Balloon from "@/components/Balloon";
import BalloonOptimizedMinimal from '@/components/Balloon/BalloonOptimizedMinimal';
import { SubscriptionPlans } from '@/components/SubscriptionPlans';
import EducationalToolbar from '@/components/Toolbar/EducationalToolbar';
import WaitingListAlert from '@/components/WaitingListAlert';
import LandingFooter from '@/components/layout/LandingFooter';
import SharedNavbar from '@/components/layout/SharedNavbar';
import { BlogPost } from '@/lib/blog';
import { ptBR } from '@clerk/localizations';
import { useAuth } from '@clerk/nextjs';
import { format } from 'date-fns';

interface FomosaasLandingProps {
  featuredBlogPosts: BlogPost[];
}

export default function FomosaasLanding({
  featuredBlogPosts,
}: FomosaasLandingProps) {
  const [scrolled, setScrolled] = useState(false);
  const [showWaitingList, setShowWaitingList] = useState(true);

  const { isSignedIn } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-100 to-fuchsia-100 dark:from-indigo-900 dark:to-fuchsia-900 overflow-hidden">
      {/* Waiting List Alert */}
      {showWaitingList && (
        <WaitingListAlert onClose={() => setShowWaitingList(false)} />
      )}

      {/* Shared Navbar */}
      <SharedNavbar scrolled={scrolled} showWaitingList={showWaitingList} />

      {/* Hero Section */}
      <section
        className={`${showWaitingList ? 'pt-48 pb-20 md:pt-56 md:pb-32' : 'pt-32 pb-20 md:pt-40 md:pb-32'}`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400">
                Fonoaudiologia Divertida
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-pink-500 to-yellow-400">
                Exercícios de fala divertidos para crianças
              </h1>
              <p className="text-lg md:text-xl text-blue-700 dark:text-blue-300 mb-8 max-w-2xl mx-auto">
                Ajudamos crianças a superar desafios de fala com exercícios
                interativos, jogos divertidos e acompanhamento profissional.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/cadastro"
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-yellow-400 text-white font-medium hover:shadow-lg hover:shadow-pink-500/20 transition-all flex items-center gap-2 w-full sm:w-auto justify-center"
                >
                  Comece Agora <ArrowRight size={16} />
                </Link>
                <Link
                  href="/como-funciona"
                  className="px-6 py-3 rounded-full bg-white dark:bg-indigo-800 text-indigo-600 dark:text-white border border-indigo-200 dark:border-indigo-700 hover:border-pink-400 dark:hover:border-pink-500 transition-all shadow-sm hover:shadow w-full sm:w-auto text-center font-medium"
                >
                  Como Funciona
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Hero Image */}
        <motion.div
          className="mt-16 relative max-w-5xl mx-auto px-4"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-blue-500/10 border border-blue-200 dark:border-blue-800">
            <BalloonOptimizedMinimal />

            {/* Skip button for power users */}
            {/* <div className="absolute top-4 right-4">
              <Link
                href="/dashboard/games"
                className="bg-white/95 hover:bg-white text-blue-600 px-3 py-2 rounded-lg text-sm font-medium shadow-lg transition-all backdrop-blur-sm"
              >
                Skip to Exercises →
              </Link>
            </div> */}
          </div>

          <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-blue-500/10 border border-blue-200 dark:border-blue-800">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-purple-500/5 dark:from-blue-500/10 dark:to-purple-500/10"></div>
            <EducationalToolbar />
          </div>
          {/* Decorative elements */}
          <div className="absolute -top-8 -right-8 w-40 h-40 bg-gradient-to-br from-pink-500/30 to-yellow-400/30 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-gradient-to-br from-cyan-500/30 to-indigo-500/30 rounded-full blur-3xl"></div>

          {/* Floating elements */}
          <motion.div
            className="absolute -top-10 right-1/4 w-16 h-16 bg-yellow-400 rounded-2xl rotate-12"
            animate={{
              y: [0, -10, 0],
              rotate: [12, 5, 12],
            }}
            transition={{
              duration: 4,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: 'reverse',
            }}
          />
          <motion.div
            className="absolute top-1/3 -left-10 w-12 h-12 bg-green-400 rounded-full"
            animate={{
              y: [0, 10, 0],
              x: [0, 5, 0],
            }}
            transition={{
              duration: 3.5,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: 'reverse',
            }}
          />
          <motion.div
            className="absolute  right-10 w-14 h-14 bg-pink-400 rounded-lg rotate-45"
            animate={{
              y: [0, -15, 0],
              rotate: [45, 30, 45],
            }}
            transition={{
              duration: 5,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: 'reverse',
            }}
          />
        </motion.div>
      </section>

      {/*/!* Features Section *!/*/}
      {/*<section id="recursos" className="py-20 bg-white dark:bg-indigo-900">*/}
      {/*    <div className="container mx-auto px-4 sm:px-6 lg:px-8">*/}
      {/*        <div className="max-w-3xl mx-auto text-center mb-16">*/}
      {/*<span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">*/}
      {/*  Recursos*/}
      {/*</span>*/}
      {/*            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-blue-900 dark:text-white">*/}
      {/*                Ferramentas divertidas para o desenvolvimento da fala*/}
      {/*            </h2>*/}
      {/*            <p className="text-lg text-blue-700 dark:text-blue-300">*/}
      {/*                Fomosaas oferece uma variedade de exercícios interativos e jogos para ajudar no desenvolvimento da fala*/}
      {/*                das crianças.*/}
      {/*            </p>*/}
      {/*        </div>*/}

      {/*        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">*/}
      {/*            {features.map((feature, index) => (*/}
      {/*                <motion.div*/}
      {/*                    key={index}*/}
      {/*                    initial={{ opacity: 0, y: 20 }}*/}
      {/*                    whileInView={{ opacity: 1, y: 0 }}*/}
      {/*                    transition={{ duration: 0.5, delay: index * 0.1 }}*/}
      {/*                    viewport={{ once: true }}*/}
      {/*                    className="relative p-6 rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-indigo-800 hover:shadow-lg hover:shadow-indigo-500/5 transition-all group"*/}
      {/*                >*/}
      {/*                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-yellow-400 flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform">*/}
      {/*                        {feature.icon}*/}
      {/*                    </div>*/}
      {/*                    <h3 className="text-xl font-semibold mb-3 text-indigo-900 dark:text-white">{feature.title}</h3>*/}
      {/*                    <p className="text-indigo-700 dark:text-indigo-200">{feature.description}</p>*/}
      {/*                </motion.div>*/}
      {/*            ))}*/}
      {/*        </div>*/}
      {/*    </div>*/}
      {/*</section>*/}

      {/* How It Works */}
      <section
        id="como-funciona"
        className="py-20 bg-white dark:bg-indigo-900"
        // className="py-20 bg-gradient-to-br from-cyan-100 to-fuchsia-100 dark:from-indigo-900 dark:to-fuchsia-900"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
              Como Funciona
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-blue-900 dark:text-white">
              Três passos simples para começar
            </h2>
            <p className="text-lg text-blue-700 dark:text-blue-300">
              Comece a jornada de desenvolvimento da fala do seu filho em
              minutos.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="bg-white dark:bg-blue-900 rounded-2xl p-6 border border-blue-200 dark:border-blue-800 shadow-sm relative z-10">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4 text-white font-bold text-xl">
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-blue-900 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="text-blue-700 dark:text-blue-300">
                    {step.description}
                  </p>
                </div>

                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-0">
                    <svg
                      width="40"
                      height="24"
                      viewBox="0 0 40 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M39.0607 13.0607C39.6464 12.4749 39.6464 11.5251 39.0607 10.9393L29.5147 1.3934C28.9289 0.807611 27.9792 0.807611 27.3934 1.3934C26.8076 1.97919 26.8076 2.92893 27.3934 3.51472L35.8787 12L27.3934 20.4853C26.8076 21.0711 26.8076 22.0208 27.3934 22.6066C27.9792 23.1924 28.9289 23.1924 29.5147 22.6066L39.0607 13.0607ZM0 13.5H38V10.5H0V13.5Z"
                        fill="#93C5FD"
                      />
                    </svg>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Content Hub Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
              Conhecimento Especializado
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-blue-900 dark:text-white">
              Aprenda com Especialistas
            </h2>
            <p className="text-lg text-blue-700 dark:text-blue-300">
              Artigos especializados, dicas práticas e recursos para
              fonoaudiólogos.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {featuredBlogPosts.map((post: any, index: number) => (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-blue-900 rounded-2xl p-6 border border-blue-200 dark:border-blue-800 shadow-sm hover:shadow-lg transition-all group"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-yellow-400 rounded-full flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-sm text-gray-500">
                    <time>
                      {format(new Date(post.date), "dd 'de' MMMM", {
                        locale: ptBR as any,
                      })}
                    </time>
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-blue-900 dark:text-white group-hover:text-pink-600 transition-colors">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h3>
                <p className="text-blue-700 dark:text-blue-300 mb-4 line-clamp-2">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {post.tags?.slice(0, 2).map((tag: string) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-pink-600 hover:text-pink-700 font-medium text-sm flex items-center gap-1"
                  >
                    Ler mais <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/blog"
              className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-yellow-400 text-white font-medium hover:shadow-lg hover:shadow-pink-500/20 transition-all"
            >
              Ver Todos os Artigos <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Exercise Examples */}
      {/*<section className="py-20 bg-white dark:bg-blue-950">*/}
      <section className="py-20 bg-gradient-to-br from-cyan-100 to-fuchsia-100 dark:from-indigo-900 dark:to-fuchsia-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
              Exercícios
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-blue-900 dark:text-white">
              Exercícios divertidos e eficazes
            </h2>
            <p className="text-lg text-blue-700 dark:text-blue-300">
              Conheça alguns dos nossos exercícios interativos que ajudam no
              desenvolvimento da fala.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {exercises.map((exercise, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-cyan-50 to-fuchsia-50 dark:from-indigo-800/50 dark:to-fuchsia-800/50 rounded-2xl overflow-hidden border border-indigo-200 dark:border-indigo-700 shadow-sm hover:shadow-md hover:shadow-indigo-500/10 transition-all"
              >
                <div className="h-48 bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 relative">
                  <Image
                    src={
                      exercise.image || '/placeholder.svg?height=200&width=400'
                    }
                    alt={exercise.title}
                    width={400}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-white/80 dark:bg-blue-900/80 flex items-center justify-center text-blue-600 dark:text-blue-400 cursor-pointer hover:scale-110 transition-transform">
                      <Play size={24} />
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white mr-3">
                      {exercise.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-blue-900 dark:text-white">
                      {exercise.title}
                    </h3>
                  </div>
                  <p className="text-blue-700 dark:text-blue-300 mb-4">
                    {exercise.description}
                  </p>
                  <div className="flex items-center text-sm text-blue-600 dark:text-blue-400">
                    <span className="flex items-center">
                      <Star
                        size={16}
                        className="mr-1 fill-yellow-400 text-yellow-400"
                      />
                      Idade: {exercise.age}
                    </span>
                    <span className="mx-2">•</span>
                    <span>{exercise.difficulty}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/exercicios"
              className="inline-flex items-center px-6 py-3 rounded-full bg-white dark:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:border-purple-400 dark:hover:border-purple-500 transition-all shadow-sm hover:shadow font-medium"
            >
              Ver todos os exercícios <ArrowRight size={16} className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section
        id="depoimentos"
        className="py-20 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400">
              Depoimentos
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-blue-900 dark:text-white">
              O que as famílias estão dizendo
            </h2>
            <p className="text-lg text-blue-700 dark:text-blue-300">
              Veja como o Almanaque da Fala tem ajudado crianças em todo o
              Brasil.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-6 rounded-2xl bg-white dark:bg-blue-900 border border-blue-200 dark:border-blue-800 shadow-sm"
              >
                <div className="flex items-center mb-4">
                  <div className="mr-4">
                    <Image
                      src={
                        testimonial.avatar ||
                        '/placeholder.svg?height=48&width=48'
                      }
                      alt={testimonial.name}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900 dark:text-white">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      {testimonial.relation}
                    </p>
                  </div>
                </div>
                <p className="text-blue-700 dark:text-blue-300 italic mb-4">
                  "{testimonial.quote}"
                </p>
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className="fill-yellow-400" />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="assinatura" className="py-20 bg-white dark:bg-blue-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
              Assinatura
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-blue-900 dark:text-white">
              Acesso completo para fonoaudiólogos
            </h2>
            <p className="text-lg text-blue-700 dark:text-blue-300">
              Todas as ferramentas necessárias para sua prática profissional.
            </p>
          </div>
          <SubscriptionPlans />
          {/*  <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">*/}
          {/*      {pricingPlans.map((plan, index) => (*/}
          {/*          <motion.div*/}
          {/*              key={index}*/}
          {/*              initial={{ opacity: 0, y: 20 }}*/}
          {/*              whileInView={{ opacity: 1, y: 0 }}*/}
          {/*              transition={{ duration: 0.5, delay: index * 0.1 }}*/}
          {/*              viewport={{ once: true }}*/}
          {/*              className={`rounded-2xl p-8 ${*/}
          {/*                  plan.featured*/}
          {/*                      ? "bg-gradient-to-b from-cyan-50 to-white dark:from-indigo-800/20 dark:to-indigo-900 border-cyan-200 dark:border-indigo-700/30 relative shadow-xl shadow-indigo-500/10"*/}
          {/*                      : "bg-white dark:bg-indigo-800 border-indigo-200 dark:border-indigo-700"*/}
          {/*              } border`}*/}
          {/*          >*/}
          {/*              {plan.featured && (*/}
          {/*                  <span className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-pink-500 to-yellow-400 text-white text-xs font-medium px-3 py-1 rounded-full">*/}
          {/*  Mais Popular*/}
          {/*</span>*/}
          {/*              )}*/}
          {/*              <h3 className="text-xl font-semibold mb-2 text-blue-900 dark:text-white">{plan.name}</h3>*/}
          {/*              <p className="text-blue-700 dark:text-blue-300 mb-6">{plan.description}</p>*/}
          {/*              <div className="mb-6">*/}
          {/*                  <span className="text-4xl font-bold text-blue-900 dark:text-white">R${plan.price}</span>*/}
          {/*                  {plan.period && <span className="text-blue-600 dark:text-blue-400">/{plan.period}</span>}*/}
          {/*              </div>*/}
          {/*              <ul className="mb-8 space-y-3">*/}
          {/*                  {plan.features.map((feature, i) => (*/}
          {/*                      <li key={i} className="flex items-center text-blue-700 dark:text-blue-300">*/}
          {/*                          <CheckCircle size={18} className="mr-2 text-green-500" />*/}
          {/*                          {feature}*/}
          {/*                      </li>*/}
          {/*                  ))}*/}
          {/*              </ul>*/}
          {/*              <Link*/}
          {/*                  href={plan.ctaLink}*/}
          {/*                  className={`block w-full py-3 px-4 rounded-full text-center font-medium ${*/}
          {/*                      plan.featured*/}
          {/*                          ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/20"*/}
          {/*                          : "bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-white hover:bg-blue-200 dark:hover:bg-blue-700"*/}
          {/*                  } transition-all`}*/}
          {/*              >*/}
          {/*                  {plan.ctaText}*/}
          {/*              </Link>*/}
          {/*          </motion.div>*/}
          {/*      ))}*/}
          {/*  </div>*/}
        </div>
      </section>

      {/* FAQ */}
      <section
        id="faq"
        className="py-20 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
              Perguntas Frequentes
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-blue-900 dark:text-white">
              Dúvidas comuns
            </h2>
            <p className="text-lg text-blue-700 dark:text-blue-300">
              Encontre respostas para as perguntas mais frequentes sobre o
              Almanaque da Fala.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            {faqs.map((faq, index) => (
              <FaqItem
                key={index}
                question={faq.question}
                answer={faq.answer}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white dark:bg-blue-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="relative p-8 md:p-12 rounded-3xl overflow-hidden"
            >
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/50 dark:to-purple-900/50"></div>

              {/* Decorative elements */}
              <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>

              <div className="relative">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-blue-900 dark:text-white">
                  Pronto para começar a jornada de fala do seu filho?
                </h2>
                <p className="text-lg text-blue-700 dark:text-blue-300 mb-8 max-w-2xl mx-auto">
                  Junte-se a milhares de famílias brasileiras que já estão
                  transformando o desenvolvimento da fala de seus filhos com o
                  Almanaque da Fala.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    href="/cadastro"
                    className="px-6 py-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:shadow-lg hover:shadow-blue-500/20 transition-all flex items-center gap-2 w-full sm:w-auto justify-center"
                  >
                    Experimente Grátis <ArrowRight size={16} />
                  </Link>
                  <Link
                    href="/contato"
                    className="px-6 py-3 rounded-full bg-white dark:bg-blue-900 text-blue-700 dark:text-white border border-blue-200 dark:border-blue-800 hover:border-purple-400 dark:hover:border-purple-500 transition-all shadow-sm hover:shadow w-full sm:w-auto text-center font-medium"
                  >
                    Fale com um Especialista
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}

// FAQ Item Component
function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-blue-200 dark:border-blue-800 py-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full text-left focus:outline-none"
      >
        <h3 className="text-lg font-medium text-blue-900 dark:text-white">
          {question}
        </h3>
        <ChevronDown
          className={`w-5 h-5 text-blue-500 transition-transform ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-2 text-blue-700 dark:text-blue-300"
        >
          <p>{answer}</p>
        </motion.div>
      )}
    </div>
  );
}

// Data
const features = [
  {
    title: 'Exercícios Interativos',
    description:
      'Mais de 100 exercícios divertidos e interativos para desenvolver diferentes aspectos da fala.',
    icon: <Mic size={24} />,
  },
  {
    title: 'Jogos Educativos',
    description:
      'Jogos coloridos e envolventes que tornam o aprendizado divertido e eficaz para crianças.',
    icon: <Play size={24} />,
  },
  {
    title: 'Acompanhamento Profissional',
    description:
      'Relatórios detalhados e orientações de especialistas em fonoaudiologia.',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>
    ),
  },
  {
    title: 'Atividades Personalizadas',
    description:
      'Exercícios adaptados às necessidades específicas de cada criança e seu desenvolvimento.',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24              24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      </svg>
    ),
  },
  {
    title: 'Biblioteca de Sons',
    description:
      'Ampla biblioteca de sons e pronúncias para praticar diferentes fonemas e palavras.',
    icon: <Volume2 size={24} />,
  },
  {
    title: 'Músicas e Rimas',
    description:
      'Músicas infantis e rimas divertidas que ajudam no desenvolvimento da linguagem.',
    icon: <Music size={24} />,
  },
];

const steps = [
  {
    title: 'Cadastre-se',
    description:
      'Crie uma conta gratuita e preencha um breve questionário sobre as necessidades do seu filho.',
  },
  {
    title: 'Receba um Plano Personalizado',
    description:
      'Nosso sistema criará um plano de exercícios personalizado com base nas necessidades específicas.',
  },
  {
    title: 'Comece a Praticar',
    description:
      'Acesse os exercícios interativos e acompanhe o progresso do seu filho de forma divertida.',
  },
];

const exercises = [
  {
    title: 'Jogo dos Sons',
    description:
      'Ajuda crianças a identificar e reproduzir diferentes sons e fonemas.',
    age: '3-6 anos',
    difficulty: 'Iniciante',
    icon: <Volume2 size={16} />,
    image: '/placeholder.svg?height=200&width=400',
  },
  {
    title: 'Rimas Divertidas',
    description:
      'Exercícios com rimas para desenvolver consciência fonológica.',
    age: '4-7 anos',
    difficulty: 'Intermediário',
    icon: <Music size={16} />,
    image: '/placeholder.svg?height=200&width=400',
  },
  {
    title: 'Histórias Faladas',
    description:
      'Narrativas interativas que incentivam a prática da fala em contextos.',
    age: '5-9 anos',
    difficulty: 'Avançado',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"></path>
        <path d="M8 7h6"></path>
        <path d="M8 11h8"></path>
        <path d="M8 15h5"></path>
      </svg>
    ),
    image: '/placeholder.svg?height=200&width=400',
  },
];

const testimonials = [
  {
    name: 'Ana Silva',
    relation: 'Mãe do Pedro, 5 anos',
    avatar: '/placeholder.svg?height=48&width=48',
    quote:
      'O Almanaque da Fala transformou a vida do meu filho. Em apenas 3 meses, ele já consegue pronunciar palavras que antes eram um desafio!',
  },
  {
    name: 'Carlos Oliveira',
    relation: 'Pai da Júlia, 7 anos',
    avatar: '/placeholder.svg?height=48&width=48',
    quote:
      'Minha filha adora os jogos e nem percebe que está fazendo terapia. Os resultados são impressionantes!',
  },
  {
    name: 'Dra. Mariana Santos',
    relation: 'Fonoaudióloga',
    avatar: '/placeholder.svg?height=48&width=48',
    quote:
      'Como profissional, recomendo o Almanaque da Fala para complementar as sessões presenciais. A plataforma é baseada em metodologias comprovadas.',
  },
];

const pricingPlans = [
  {
    name: 'Básico',
    description: 'Ideal para começar a jornada de desenvolvimento da fala.',
    price: '49,90',
    period: 'mês',
    features: [
      'Acesso a 30+ exercícios básicos',
      'Relatórios mensais de progresso',
      'Suporte por e-mail',
      'Acesso para 1 criança',
    ],
    ctaText: 'Começar Agora',
    ctaLink: '/cadastro',
    featured: false,
  },
  {
    name: 'Premium',
    description: 'Nossa opção mais popular para famílias.',
    price: '89,90',
    period: 'mês',
    features: [
      'Acesso a 100+ exercícios',
      'Relatórios semanais detalhados',
      'Suporte prioritário',
      'Acesso para até 3 crianças',
      'Consulta mensal com especialista',
    ],
    ctaText: 'Experimente Grátis',
    ctaLink: '/trial',
    featured: true,
  },
  {
    name: 'Escolas',
    description: 'Para instituições educacionais e clínicas.',
    price: '249,90',
    period: 'mês',
    features: [
      'Acesso ilimitado a todos exercícios',
      'Painel administrativo para educadores',
      'Suporte dedicado',
      'Acesso para até 15 crianças',
      'Treinamento para educadores',
    ],
    ctaText: 'Fale Conosco',
    ctaLink: '/contato',
    featured: false,
  },
];

const faqs = [
  {
    question: 'O que é o Almanaque da Fala?',
    answer:
      'Almanaque da Fala é uma plataforma online de exercícios de fonoaudiologia desenvolvida especialmente para crianças brasileiras. Oferecemos jogos interativos e atividades divertidas que ajudam no desenvolvimento da fala e linguagem.',
  },
  {
    question: 'A partir de qual idade posso usar o Almanaque da Fala?',
    answer:
      'Nossa plataforma possui exercícios para crianças a partir de 3 anos de idade. Temos atividades específicas para diferentes faixas etárias e níveis de desenvolvimento.',
  },
  {
    question: 'O Almanaque da Fala substitui a terapia com um fonoaudiólogo?',
    answer:
      'Não. O Almanaque da Fala é uma ferramenta complementar ao tratamento fonoaudiológico. Recomendamos sempre o acompanhamento de um profissional especializado para casos que necessitem de intervenção terapêutica.',
  },
  {
    question: 'Posso cancelar minha assinatura a qualquer momento?',
    answer:
      'Sim, você pode cancelar sua assinatura quando quiser, sem multas ou taxas adicionais. O acesso permanecerá ativo até o final do período já pago.',
  },
  {
    question: 'Como sei se o Almanaque da Fala é adequado para meu filho?',
    answer:
      'Oferecemos um período de teste gratuito de 7 dias para que você possa experimentar nossa plataforma. Além disso, nosso questionário inicial ajuda a identificar as necessidades específicas da criança.',
  },
];
