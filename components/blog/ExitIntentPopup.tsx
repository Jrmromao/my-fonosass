'use client';

import { BookOpen, Play, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface ExitIntentPopupProps {
  currentArticle?: {
    title: string;
    slug: string;
    tags?: string[];
  };
}

export default function ExitIntentPopup({
  currentArticle,
}: ExitIntentPopupProps) {
  const [showPopup, setShowPopup] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    // Check if popup was already shown in this session
    const popupShown = sessionStorage.getItem('exitIntentShown');
    if (popupShown) {
      setHasShown(true);
      return;
    }

    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger if mouse is moving towards the top of the page
      if (e.clientY <= 0 && !hasShown) {
        setShowPopup(true);
        setHasShown(true);
        sessionStorage.setItem('exitIntentShown', 'true');
      }
    };

    // Add event listener with a small delay to avoid false triggers
    const timeoutId = setTimeout(() => {
      document.addEventListener('mouseleave', handleMouseLeave);
    }, 2000); // Wait 2 seconds before enabling exit intent

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [hasShown]);

  const handleClose = () => {
    setShowPopup(false);
  };

  const getTopicLink = () => {
    if (!currentArticle?.tags?.[0]) return '/dashboard';
    const topic = currentArticle.tags[0].toLowerCase();
    const topicExercises = {
      exercícios: '/dashboard?filter=exercicios',
      fonemas: '/dashboard?filter=fonemas',
      lgpd: '/dashboard?filter=prontuarios',
      terapia: '/dashboard?filter=terapia',
      prontuários: '/dashboard?filter=prontuarios',
    };
    return topicExercises[topic as keyof typeof topicExercises] || '/dashboard';
  };

  if (!showPopup) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center relative animate-in fade-in-0 zoom-in-95 duration-300">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-yellow-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <BookOpen className="w-8 h-8 text-white" />
        </div>

        {/* Content */}
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Não vá embora ainda! 🎯
        </h3>

        {currentArticle ? (
          <>
            <p className="text-gray-600 mb-6">
              Que tal conhecer nossos exercícios práticos baseados no artigo{' '}
              <strong>"{currentArticle.title}"</strong>?
            </p>
            <div className="space-y-3">
              <Link
                href={getTopicLink()}
                className="w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-yellow-400 text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
                onClick={handleClose}
              >
                <Play className="w-4 h-4" />
                Ver Exercícios Relacionados
              </Link>
              <Link
                href="/blog"
                className="w-full px-6 py-3 border border-gray-300 text-gray-600 rounded-lg font-medium hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                onClick={handleClose}
              >
                <BookOpen className="w-4 h-4" />
                Continuar Lendo Blog
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className="text-gray-600 mb-6">
              Que tal conhecer nossa plataforma de exercícios fonoaudiológicos?
            </p>
            <div className="space-y-3">
              <Link
                href="/sign-up"
                className="w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-yellow-400 text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
                onClick={handleClose}
              >
                <Play className="w-4 h-4" />
                Experimente Grátis
              </Link>
              <Link
                href="/dashboard"
                className="w-full px-6 py-3 border border-gray-300 text-gray-600 rounded-lg font-medium hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                onClick={handleClose}
              >
                <BookOpen className="w-4 h-4" />
                Ver Exercícios
              </Link>
            </div>
          </>
        )}

        <p className="text-xs text-gray-500 mt-4">
          Apenas conteúdo de qualidade, sem spam
        </p>
      </div>
    </div>
  );
}
