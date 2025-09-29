'use client';

import { motion } from 'framer-motion';
import { Award, BarChart3, BookOpen, Clock, Shield, Users } from 'lucide-react';
import Link from 'next/link';

interface EducationalHeroProps {
  className?: string;
}

export default function EducationalHero({
  className = '',
}: EducationalHeroProps) {
  return (
    <div
      className={`relative bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-900 dark:to-teal-900 rounded-2xl overflow-hidden ${className}`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <defs>
            <pattern
              id="grid"
              width="10"
              height="10"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 10 0 L 0 0 0 10"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>
      </div>

      {/* Main Content */}
      <div className="relative z-10 p-8 md:p-12">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-emerald-900 dark:text-emerald-100 mb-4">
              Plataforma Educacional para Fonoaudiólogos
            </h2>
            <p className="text-lg text-emerald-700 dark:text-emerald-300 max-w-2xl mx-auto">
              Ferramentas profissionais para desenvolvimento da fala e linguagem
              com metodologia baseada em evidências científicas.
            </p>
          </motion.div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 + index * 0.1 }}
                className="bg-white/70 dark:bg-emerald-800/70 rounded-xl p-6 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-emerald-800/80 transition-all"
              >
                <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100 mb-2 text-center">
                  {feature.title}
                </h3>
                <p className="text-sm text-emerald-700 dark:text-emerald-300 text-center">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white/60 dark:bg-emerald-800/60 rounded-xl p-6 backdrop-blur-sm"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                    className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-1"
                  >
                    {stat.value}
                  </motion.div>
                  <div className="text-sm text-emerald-700 dark:text-emerald-300">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center mt-8"
          >
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/dashboard/exercises"
                className="inline-flex items-center px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors shadow-lg hover:shadow-xl"
              >
                <BookOpen className="w-5 h-5 mr-2" />
                Acessar Exercícios
              </Link>
              <Link
                href="/dashboard/patients"
                className="inline-flex items-center px-8 py-3 bg-white dark:bg-emerald-800 text-emerald-600 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700 font-medium rounded-lg transition-colors hover:bg-emerald-50 dark:hover:bg-emerald-800/80"
              >
                <Users className="w-5 h-5 mr-2" />
                Gerenciar Pacientes
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

const features = [
  {
    title: 'Exercícios Baseados em Evidências',
    description:
      'Atividades desenvolvidas com base em pesquisas científicas comprovadas.',
    icon: <BookOpen className="w-6 h-6 text-white" />,
  },
  {
    title: 'Acompanhamento Individualizado',
    description: 'Sistema de acompanhamento personalizado para cada paciente.',
    icon: <Users className="w-6 h-6 text-white" />,
  },
  {
    title: 'Relatórios Profissionais',
    description:
      'Geração automática de relatórios detalhados para documentação.',
    icon: <BarChart3 className="w-6 h-6 text-white" />,
  },
  {
    title: 'Conformidade LGPD',
    description:
      'Totalmente em conformidade com a Lei Geral de Proteção de Dados.',
    icon: <Shield className="w-6 h-6 text-white" />,
  },
  {
    title: 'Sessões Agendadas',
    description: 'Sistema completo de agendamento e gestão de sessões.',
    icon: <Clock className="w-6 h-6 text-white" />,
  },
  {
    title: 'Certificação Profissional',
    description: 'Plataforma reconhecida por conselhos profissionais.',
    icon: <Award className="w-6 h-6 text-white" />,
  },
];

const stats = [
  { value: '500+', label: 'Exercícios Disponíveis' },
  { value: '50+', label: 'Fonoaudiólogos Ativos' },
  { value: '1000+', label: 'Pacientes Atendidos' },
  { value: '98%', label: 'Satisfação dos Usuários' },
];
