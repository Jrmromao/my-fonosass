'use client';

import { Logo } from '@/components/brand/Logo';
import { useAuth } from '@clerk/nextjs';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface SharedNavbarProps {
  scrolled?: boolean;
  showWaitingList?: boolean;
  className?: string;
  /** Background tone; 'lavender' matches the landing page background. */
  tone?: 'white' | 'lavender';
}

const TONE_CLASSES = {
  white: {
    scrolled: 'bg-white/95 backdrop-blur-md shadow-sm',
    top: 'bg-white/50 backdrop-blur-sm',
  },
  lavender: {
    scrolled: 'bg-violet-100/95 backdrop-blur-md shadow-sm',
    top: 'bg-violet-100',
  },
} as const;

const NAV_ITEMS = [
  { href: '/#biblioteca', label: 'Biblioteca' },
  { href: '/#planos', label: 'Planos' },
  { href: '/blog', label: 'Blog' },
  { href: '/contato', label: 'Contato' },
];

export default function SharedNavbar({
  scrolled = false,
  showWaitingList = false,
  className = '',
  tone = 'white',
}: SharedNavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(scrolled);
  const { isSignedIn } = useAuth();

  useEffect(() => {
    const handleScroll = () => setHasScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed left-0 right-0 z-50 transition-all duration-200 ${
        showWaitingList ? 'top-16' : 'top-0'
      } ${hasScrolled ? TONE_CLASSES[tone].scrolled : TONE_CLASSES[tone].top} ${className}`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          {/* Logo + name on every screen size. */}
          <Link
            href="/"
            className="flex items-center gap-2"
            aria-label="Almanaque da Fala, página inicial"
          >
            <Logo size="nav" href={null} priority />
            <span
              aria-hidden
              className="text-base font-bold text-violet-950 font-display md:text-lg"
            >
              Almanaque da Fala
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              >
                {item.label}
              </Link>
            ))}

            <div className="ml-4 flex items-center gap-2">
              {isSignedIn ? (
                <Link
                  href="/dashboard"
                  className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
                >
                  Meu Painel
                </Link>
              ) : (
                <>
                  <Link
                    href="/sign-in"
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    Entrar
                  </Link>
                  <Link
                    href="/sign-up"
                    className="px-4 py-2 bg-neutral-900 text-white text-sm font-medium rounded-md hover:bg-neutral-800 transition-colors"
                  >
                    Assinar
                  </Link>
                </>
              )}
            </div>
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="px-4 py-3 space-y-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-3 mt-2 border-t border-gray-100 space-y-2">
              {isSignedIn ? (
                <Link
                  href="/dashboard"
                  className="block px-3 py-2.5 text-sm font-medium text-gray-900"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Meu Painel
                </Link>
              ) : (
                <>
                  <Link
                    href="/sign-in"
                    className="block px-3 py-2.5 text-sm font-medium text-gray-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Entrar
                  </Link>
                  <Link
                    href="/sign-up"
                    className="block mx-3 px-4 py-2.5 text-center bg-neutral-900 text-white text-sm font-medium rounded-md hover:bg-neutral-800"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Assinar
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
