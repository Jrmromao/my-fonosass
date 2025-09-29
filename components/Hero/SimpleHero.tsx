'use client';

import { motion } from 'framer-motion';
import { BarChart3, BookOpen, Mic, Shield, Users } from 'lucide-react';
import Link from 'next/link';

interface SimpleHeroProps {
  className?: string;
}

export default function SimpleHero({ className = '' }: SimpleHeroProps) {
  return (
    <div
      className={`bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 ${className}`}
    >
      <div className="p-8 md:p-12">
        <div className="text-center mb-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4"
          >
            Plataforma Profissional de Fonoaudiologia
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
          >
            Ferramentas especializadas para fonoaudiólogos com exercícios
            interativos, gestão de pacientes e relatórios profissionais.
          </motion.p>
        </div>

        {/* Key Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
              className="text-center p-4"
            >
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
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
            href="/dashboard/exercises"
            className="inline-flex items-center px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-lg hover:shadow-xl"
          >
            <BookOpen className="w-5 h-5 mr-2" />
            Acessar Exercícios
          </Link>
          <Link
            href="/dashboard/games"
            className="inline-flex items-center px-8 py-3 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-700 font-medium rounded-lg transition-colors hover:bg-blue-50 dark:hover:bg-gray-700"
          >
            <Mic className="w-5 h-5 mr-2" />
            Ver Jogos Interativos
          </Link>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700"
        >
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              Conforme LGPD
            </div>
            <div className="flex items-center">
              <BarChart3 className="w-4 h-4 mr-2" />
              Relatórios Detalhados
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Acompanhamento Profissional
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

const features = [
  {
    title: 'Exercícios Interativos',
    description: 'Mais de 500 exercícios desenvolvidos por especialistas',
    icon: <Mic className="w-8 h-8 text-blue-600" />,
  },
  {
    title: 'Jogos Educativos',
    description: 'Atividades lúdicas para desenvolvimento da fala',
    icon: <BookOpen className="w-8 h-8 text-blue-600" />,
  },
  {
    title: 'Relatórios Profissionais',
    description: 'Documentação automática e relatórios detalhados',
    icon: <BarChart3 className="w-8 h-8 text-blue-600" />,
  },
];
