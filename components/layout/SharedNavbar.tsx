'use client';

import { useAuth } from '@clerk/nextjs';
import { Menu, X } from 'lucide-react';
import Image from 'next/image';
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
      } ${hasScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-white/50 backdrop-blur-sm'} ${className}`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-14 h-14 transition-transform group-hover:scale-105">
              <Image
                src="/images/logo.png"
                alt="Almanaque da Fala"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="text-base font-bold text-gray-900 font-display">
              Almanaque da Fala
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { href: '/blog', label: 'Blog' },
              { href: '/recursos-gratuitos', label: 'Recursos' },
              { href: '/especialistas', label: 'Especialistas' },
              { href: '/faq', label: 'FAQ' },
              { href: '/contato', label: 'Contato' },
            ].map((item) => (
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
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-full hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    Começar grátis
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
            {[
              { href: '/blog', label: 'Blog' },
              { href: '/recursos-gratuitos', label: 'Recursos' },
              { href: '/especialistas', label: 'Especialistas' },
              { href: '/faq', label: 'FAQ' },
              { href: '/contato', label: 'Contato' },
            ].map((item) => (
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
                    className="block mx-3 px-4 py-2.5 text-center bg-indigo-600 text-white text-sm font-medium rounded-full hover:bg-indigo-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Começar grátis
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
