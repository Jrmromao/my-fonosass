'use client';

import { APP_NAME } from '@/utils/constants';
import { useAuth } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface SharedNavbarProps {
  scrolled?: boolean;
  showWaitingList?: boolean;
  className?: string;
}

export default function SharedNavbar({
  scrolled = false,
  showWaitingList = false,
  className = '',
}: SharedNavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isSignedIn } = useAuth();

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMenuOpen && !(event.target as Element).closest('.mobile-menu')) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  return (
    <header
      className={`fixed left-0 right-0 z-50 transition-all duration-300 ${
        showWaitingList ? 'top-16' : 'top-0'
      } ${
        scrolled
          ? 'bg-white/80 dark:bg-indigo-800/80 backdrop-blur-md shadow-sm'
          : 'bg-transparent'
      } ${className}`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-yellow-400 flex items-center justify-center">
                <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
              </div>
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-yellow-400">
                {APP_NAME}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/blog"
              className="text-indigo-600 hover:text-pink-500 dark:text-cyan-300 dark:hover:text-yellow-300 transition-colors font-medium"
            >
              Blog
            </Link>

            <Link
              href="/recursos-gratuitos"
              className="text-indigo-600 hover:text-pink-500 dark:text-cyan-300 dark:hover:text-yellow-300 transition-colors font-medium"
            >
              Recursos Grátis
            </Link>
            <Link
              href="/especialistas"
              className="text-indigo-600 hover:text-pink-500 dark:text-cyan-300 dark:hover:text-yellow-300 transition-colors font-medium"
            >
              Especialistas
            </Link>
            <Link
              href="/faq"
              className="text-indigo-600 hover:text-pink-500 dark:text-cyan-300 dark:hover:text-yellow-300 transition-colors font-medium"
            >
              FAQ
            </Link>
            <Link
              href="/contato"
              className="text-indigo-600 hover:text-pink-500 dark:text-cyan-300 dark:hover:text-yellow-300 transition-colors font-medium"
            >
              Contato
            </Link>

            {isSignedIn ? (
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-full bg-white dark:bg-indigo-800 text-indigo-600 dark:text-white border border-indigo-200 dark:border-indigo-700 hover:border-pink-400 dark:hover:border-pink-500 transition-all shadow-sm hover:shadow font-medium"
              >
                Painel de Controle
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="px-4 py-2 rounded-full bg-white dark:bg-indigo-800 text-indigo-600 dark:text-white border border-indigo-200 dark:border-indigo-700 hover:border-pink-400 dark:hover:border-pink-500 transition-all shadow-sm hover:shadow font-medium"
                >
                  Entrar
                </Link>
                <Link
                  href="/sign-up"
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 to-yellow-400 text-white hover:shadow-lg hover:shadow-pink-500/20 transition-all font-medium"
                >
                  Experimente Grátis
                </Link>
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-full bg-blue-100 dark:bg-blue-800 text-blue-500 dark:text-blue-400"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden bg-white dark:bg-blue-900 shadow-lg mobile-menu"
        >
          <div className="px-4 py-5 space-y-4">
            <Link
              href="/blog"
              className="block px-3 py-2 rounded-lg text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Blog
            </Link>
            <Link
              href="/comunidade"
              className="block px-3 py-2 rounded-lg text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Recursos
            </Link>
            <Link
              href="/especialistas"
              className="block px-3 py-2 rounded-lg text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Especialistas
            </Link>
            <Link
              href="/faq"
              className="block px-3 py-2 rounded-lg text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              FAQ
            </Link>
            <Link
              href="/contato"
              className="block px-3 py-2 rounded-lg text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Contato
            </Link>
            <div className="pt-4 space-y-3">
              {isSignedIn ? (
                <Link
                  href="/dashboard"
                  className="block w-full px-4 py-2 text-center rounded-full bg-white dark:bg-blue-800 text-blue-700 dark:text-white border border-blue-200 dark:border-blue-700 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Painel de Controle
                </Link>
              ) : (
                <>
                  <Link
                    href="/sign-in"
                    className="block w-full px-4 py-2 text-center rounded-full bg-white dark:bg-blue-800 text-blue-700 dark:text-white border border-blue-200 dark:border-blue-700 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Entrar
                  </Link>
                  <Link
                    href="/sign-up"
                    className="block w-full px-4 py-2 text-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Experimente Grátis
                  </Link>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </header>
  );
}
