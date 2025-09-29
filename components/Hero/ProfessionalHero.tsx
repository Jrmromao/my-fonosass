'use client';

import { motion } from 'framer-motion';
import { BookOpen, Heart, Mic, Star, Users, Volume2 } from 'lucide-react';
import Link from 'next/link';

interface ProfessionalHeroProps {
  className?: string;
}

export default function ProfessionalHero({
  className = '',
}: ProfessionalHeroProps) {
  return (
    <div
      className={`relative bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-indigo-900 dark:to-blue-900 rounded-2xl overflow-hidden ${className}`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-400 rounded-full"></div>
        <div className="absolute top-32 right-16 w-16 h-16 bg-indigo-400 rounded-full"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-purple-400 rounded-full"></div>
        <div className="absolute bottom-32 right-1/3 w-8 h-8 bg-pink-400 rounded-full"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 p-8 md:p-12">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left Side - Content */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-indigo-900 dark:text-indigo-100 mb-4">
                Exercícios de Fala Interativos
              </h2>
              <p className="text-lg text-indigo-700 dark:text-indigo-300 mb-6">
                Plataforma profissional para fonoaudiólogos com exercícios
                personalizados e acompanhamento especializado.
              </p>
            </motion.div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 + index * 0.1 }}
                  className="flex items-center space-x-3 p-3 bg-white/60 dark:bg-indigo-800/60 rounded-lg backdrop-blur-sm"
                >
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    {feature.icon}
                  </div>
                  <span className="text-sm font-medium text-indigo-900 dark:text-indigo-100">
                    {feature.title}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Link
                href="/dashboard/exercises"
                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-lg hover:shadow-xl"
              >
                <BookOpen className="w-5 h-5 mr-2" />
                Ver Exercícios
              </Link>
            </motion.div>
          </div>

          {/* Right Side - Visual */}
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              {/* Main Illustration */}
              <div className="bg-white/80 dark:bg-indigo-800/80 rounded-2xl p-6 shadow-xl">
                <div className="text-center space-y-4">
                  {/* Speech Therapy Icons */}
                  <div className="flex justify-center space-x-4">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center"
                    >
                      <Mic className="w-6 h-6 text-green-600" />
                    </motion.div>
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                      className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center"
                    >
                      <Volume2 className="w-6 h-6 text-blue-600" />
                    </motion.div>
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                      className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center"
                    >
                      <Heart className="w-6 h-6 text-purple-600" />
                    </motion.div>
                  </div>

                  {/* Progress Indicators */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-indigo-600 dark:text-indigo-400">
                        Progresso da Sessão
                      </span>
                      <span className="font-medium text-indigo-900 dark:text-indigo-100">
                        75%
                      </span>
                    </div>
                    <div className="w-full bg-indigo-200 dark:bg-indigo-700 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '75%' }}
                        transition={{ duration: 2, delay: 1 }}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 pt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">
                        12
                      </div>
                      <div className="text-xs text-indigo-600 dark:text-indigo-400">
                        Exercícios
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">
                        8
                      </div>
                      <div className="text-xs text-indigo-600 dark:text-indigo-400">
                        Concluídos
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">
                        4
                      </div>
                      <div className="text-xs text-indigo-600 dark:text-indigo-400">
                        Restantes
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg"
              >
                <Star className="w-4 h-4 text-white" />
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                className="absolute -bottom-4 -left-4 w-6 h-6 bg-pink-400 rounded-full flex items-center justify-center shadow-lg"
              >
                <Heart className="w-3 h-3 text-white" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

const features = [
  {
    title: 'Exercícios Personalizados',
    icon: <BookOpen className="w-4 h-4 text-white" />,
  },
  {
    title: 'Acompanhamento Profissional',
    icon: <Users className="w-4 h-4 text-white" />,
  },
  {
    title: 'Relatórios Detalhados',
    icon: <Star className="w-4 h-4 text-white" />,
  },
  {
    title: 'Interface Amigável',
    icon: <Heart className="w-4 h-4 text-white" />,
  },
];
