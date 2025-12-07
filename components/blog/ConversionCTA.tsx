'use client';

import { ArrowRight, BookOpen, Play } from 'lucide-react';
import Link from 'next/link';

interface ConversionCTAProps {
  variant?: 'default' | 'article' | 'topic';
  topic?: string;
  className?: string;
}

export default function ConversionCTA({
  variant = 'default',
  topic,
  className = '',
}: ConversionCTAProps) {
  const topicExercises = {
    exercícios: '/dashboard?filter=exercicios',
    fonemas: '/dashboard?filter=fonemas',
    lgpd: '/dashboard?filter=prontuarios',
    terapia: '/dashboard?filter=terapia',
    prontuários: '/dashboard?filter=prontuarios',
  };

  const getTopicLink = () => {
    if (!topic) return '/dashboard';
    const normalizedTopic = topic.toLowerCase();
    return (
      topicExercises[normalizedTopic as keyof typeof topicExercises] ||
      '/dashboard'
    );
  };

  if (variant === 'article') {
    return (
      <div
        className={`mt-8 p-6 bg-gradient-to-r from-pink-50 to-yellow-50 rounded-xl border border-pink-200 ${className}`}
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-2">
              Gostou deste artigo?
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              Acesse nossa plataforma e coloque em prática essas dicas com
              exercícios interativos.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/sign-up"
                className="px-4 py-2 bg-gradient-to-r from-pink-500 to-yellow-400 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" />
                Experimente Grátis
              </Link>
              <Link
                href="/dashboard"
                className="px-4 py-2 border border-pink-300 text-pink-600 rounded-lg text-sm font-medium hover:bg-pink-50 transition-all flex items-center justify-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                Ver Exercícios
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'topic') {
    return (
      <div
        className={`mt-8 p-6 bg-blue-50 rounded-xl border border-blue-200 ${className}`}
      >
        <h4 className="font-semibold text-blue-900 mb-2">
          Pronto para colocar em prática?
        </h4>
        <p className="text-sm text-blue-700 mb-4">
          Acesse exercícios específicos sobre {topic} na nossa plataforma.
        </p>
        <Link
          href={getTopicLink()}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all gap-2"
        >
          <Play className="w-4 h-4" />
          Ver Exercícios de {topic} <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  // Default variant
  return (
    <div
      className={`mt-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 ${className}`}
    >
      <div className="text-center">
        <h4 className="font-semibold text-gray-900 mb-2">
          Transforme sua prática clínica
        </h4>
        <p className="text-sm text-gray-600 mb-4">
          Acesse nossa biblioteca completa de exercícios fonoaudiológicos e
          ferramentas profissionais.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/sign-up"
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-yellow-400 text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4" />
            Começar Teste Grátis
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3 border border-indigo-300 text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            Explorar Plataforma
          </Link>
        </div>
      </div>
    </div>
  );
}
