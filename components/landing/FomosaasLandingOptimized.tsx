'use client';

import ProfessionalBalloonHero from '@/components/Hero/ProfessionalBalloonHero';
import LandingPagePerformanceMonitor from '@/components/LandingPagePerformanceMonitor';
import { usePerformanceOptimizations } from '@/components/PerformanceOptimizations';
import { SubscriptionPlans } from '@/components/SubscriptionPlans';
import WaitingListAlert from '@/components/WaitingListAlert';
import LandingFooter from '@/components/layout/LandingFooter';
import SharedNavbar from '@/components/layout/SharedNavbar';
import { BlogPost } from '@/lib/blog';
import { useAuth } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Mic, Music, Play, Volume2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Suspense, lazy, useEffect, useState } from 'react';

// Lazy load heavy components
const BalloonOptimizedMinimal = lazy(
  () => import('@/components/Balloon/BalloonOptimizedMinimal')
);

interface FomosaasLandingOptimizedProps {
  featuredBlogPosts: BlogPost[];
}

export default function FomosaasLandingOptimized({
  featuredBlogPosts,
}: FomosaasLandingOptimizedProps) {
  const [scrolled, setScrolled] = useState(false);
  const [showWaitingList, setShowWaitingList] = useState(true);
  const [showFullBalloon, setShowFullBalloon] = useState(false);

  const { isSignedIn } = useAuth();

  // Apply performance optimizations
  usePerformanceOptimizations();

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

        {/* Professional Balloon Hero */}
        <motion.div
          className="mt-16 relative max-w-6xl mx-auto px-4"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <ProfessionalBalloonHero />
        </motion.div>
      </section>

      {/* Features Section - Optimized */}
      <section className="py-20 bg-white/50 dark:bg-indigo-900/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-indigo-900 dark:text-indigo-100">
              Por que escolher nossa plataforma?
            </h2>
            <p className="text-lg text-blue-700 dark:text-blue-300">
              Jogos interativos e exercícios educativos para desenvolvimento da
              fala
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-6"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-yellow-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-indigo-900 dark:text-indigo-100">
                  {feature.title}
                </h3>
                <p className="text-blue-700 dark:text-blue-300">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Exercises Section - Optimized with lazy loading */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-indigo-900 dark:text-indigo-100">
              Exercícios Interativos
            </h2>
            <p className="text-lg text-blue-700 dark:text-blue-300">
              Jogos e atividades desenvolvidos por especialistas em
              fonoaudiologia
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
                    src="/placeholder.svg?height=200&width=400"
                    alt={exercise.title}
                    width={400}
                    height={200}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-white/80 dark:bg-blue-900/80 flex items-center justify-center text-blue-600 dark:text-blue-400 cursor-pointer hover:scale-110 transition-transform">
                      <Play size={24} />
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center mb-3">
                    <span className="text-blue-600 dark:text-blue-400 mr-2">
                      {exercise.icon}
                    </span>
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      {exercise.age}
                    </span>
                    <span className="mx-2 text-blue-300">•</span>
                    <span className="text-sm text-blue-500 dark:text-blue-400">
                      {exercise.difficulty}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-indigo-900 dark:text-indigo-100">
                    {exercise.title}
                  </h3>
                  <p className="text-blue-700 dark:text-blue-300 text-sm">
                    {exercise.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Subscription Plans - Lazy loaded */}
      <section className="py-20 bg-white/50 dark:bg-indigo-900/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Suspense
            fallback={
              <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-indigo-900 dark:text-indigo-100">
                  Planos e Preços
                </h2>
                <div className="h-64 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center">
                  <p className="text-blue-600 font-medium">
                    Carregando planos...
                  </p>
                </div>
              </div>
            }
          >
            <SubscriptionPlans />
          </Suspense>
        </div>
      </section>

      {/* Footer */}
      <LandingFooter />

      {/* Performance Monitor (Development Only) */}
      <LandingPagePerformanceMonitor />
    </div>
  );
}

// Data moved outside component to prevent re-creation
const features = [
  {
    title: 'Jogos Interativos',
    description:
      'Atividades lúdicas e divertidas para desenvolvimento da fala e linguagem.',
    icon: <Volume2 size={24} className="text-white" />,
  },
  {
    title: 'Exercícios Educativos',
    description: 'Conteúdo desenvolvido por especialistas em fonoaudiologia.',
    icon: <Mic size={24} className="text-white" />,
  },
  {
    title: 'Progresso Detalhado',
    description:
      'Acompanhe o desenvolvimento com relatórios e métricas de progresso.',
    icon: <BookOpen size={24} className="text-white" />,
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
  },
  {
    title: 'Rimas Divertidas',
    description:
      'Exercícios com rimas para desenvolver consciência fonológica.',
    age: '4-7 anos',
    difficulty: 'Intermediário',
    icon: <Music size={16} />,
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
  },
];
