'use client';

import { motion } from 'framer-motion';
import { BookOpen, Mic, Play, Star, Volume2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface ProfessionalBalloonHeroProps {
  className?: string;
}

export default function ProfessionalBalloonHero({
  className = '',
}: ProfessionalBalloonHeroProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className={`relative bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-indigo-900 dark:to-blue-900 rounded-2xl overflow-hidden ${className}`}
    >
      {/* Professional Balloon Animation */}
      <div className="absolute inset-0 overflow-hidden">
        {mounted && (
          <>
            {/* Floating Balloons - Professional Style */}
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-8 h-10 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full"
                style={{
                  left: `${10 + i * 12}%`,
                  top: `${20 + (i % 3) * 25}%`,
                }}
                animate={{
                  y: [0, -15, 0],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 3 + i * 0.5,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              >
                {/* Balloon string */}
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0.5 h-6 bg-gray-400"></div>
              </motion.div>
            ))}

            {/* Speech therapy icons floating */}
            <motion.div
              className="absolute top-1/4 left-1/4 w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center"
              animate={{
                y: [0, -10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: 0.5,
              }}
            >
              <Mic className="w-6 h-6 text-green-600" />
            </motion.div>

            <motion.div
              className="absolute top-1/3 right-1/4 w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center"
              animate={{
                y: [0, -10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: 1,
              }}
            >
              <Volume2 className="w-6 h-6 text-purple-600" />
            </motion.div>

            <motion.div
              className="absolute bottom-1/3 left-1/3 w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center"
              animate={{
                y: [0, -10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: 1.5,
              }}
            >
              <BookOpen className="w-6 h-6 text-pink-600" />
            </motion.div>
          </>
        )}
      </div>

      {/* Main Content */}
      <div className="relative z-10 p-8 md:p-12">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-indigo-900 dark:text-indigo-100 mb-4">
              Exercícios de Fala Interativos
            </h2>
            <p className="text-lg text-indigo-700 dark:text-indigo-300 mb-8 max-w-2xl mx-auto">
              Jogos educativos e exercícios personalizados para desenvolvimento
              da fala e linguagem de forma divertida e eficaz.
            </p>
          </motion.div>

          {/* Interactive Demo Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/80 dark:bg-indigo-800/80 rounded-2xl p-6 mb-8 backdrop-blur-sm"
          >
            <div className="flex items-center justify-center space-x-4 mb-4">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white"
              >
                <Play className="w-8 h-8" />
              </motion.div>
              <div className="text-left">
                <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100">
                  Jogo dos Fonemas
                </h3>
                <p className="text-sm text-indigo-600 dark:text-indigo-300">
                  Clique nos balões para praticar sons
                </p>
              </div>
            </div>

            {/* Mini balloon grid */}
            <div className="grid grid-cols-4 gap-2 max-w-xs mx-auto">
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.button
                  key={i}
                  className="w-8 h-10 bg-gradient-to-b from-pink-400 to-pink-600 rounded-full hover:scale-110 transition-transform"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0.5 h-3 bg-pink-300"></div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                className="text-center p-4"
              >
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-800 rounded-full flex items-center justify-center mx-auto mb-3">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-indigo-600 dark:text-indigo-300">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/dashboard/games"
              className="inline-flex items-center px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors shadow-lg hover:shadow-xl"
            >
              <Play className="w-5 h-5 mr-2" />
              Jogar Agora
            </Link>
            <Link
              href="/dashboard/exercises"
              className="inline-flex items-center px-8 py-3 bg-white dark:bg-indigo-800 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700 font-medium rounded-lg transition-colors hover:bg-indigo-50 dark:hover:bg-indigo-800/80"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Ver Exercícios
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

const features = [
  {
    title: 'Jogos Interativos',
    description: 'Atividades lúdicas para desenvolvimento da fala',
    icon: <Play className="w-6 h-6 text-indigo-600" />,
  },
  {
    title: 'Exercícios Personalizados',
    description: 'Conteúdo adaptado para cada necessidade',
    icon: <BookOpen className="w-6 h-6 text-indigo-600" />,
  },
  {
    title: 'Acompanhamento',
    description: 'Relatórios de progresso detalhados',
    icon: <Star className="w-6 h-6 text-indigo-600" />,
  },
];
