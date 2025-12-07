'use client';

import { cn } from '@/lib/utils';
import { ArrowLeft, Home } from 'lucide-react';
import Link from 'next/link';

interface BackToBlogButtonProps {
  variant?: 'default' | 'minimal' | 'enhanced' | 'floating' | 'auth';
  className?: string;
  showHomeIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export default function BackToBlogButton({
  variant = 'default',
  className,
  showHomeIcon = false,
  size = 'md',
  showText = true,
}: BackToBlogButtonProps) {
  const baseClasses =
    'inline-flex items-center gap-2 transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 rounded-lg';

  const authBaseClasses =
    'group flex items-center space-x-2 px-3 py-2 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-indigo-200 w-fit';

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 min-h-[32px]',
    md: 'text-sm px-4 py-2 min-h-[40px] sm:px-6 sm:py-2.5',
    lg: 'text-base px-6 py-3 min-h-[48px] sm:px-8 sm:py-4',
  };

  const variantClasses = {
    default:
      'text-gray-600 hover:text-pink-600 hover:bg-pink-50 border border-gray-200 hover:border-pink-300 hover:shadow-sm active:scale-95',
    minimal:
      'text-gray-400 hover:text-gray-700 transition-colors hover:bg-gray-50 rounded-md px-2 py-1 text-sm',
    enhanced:
      'text-gray-600 hover:text-pink-600 bg-white border border-gray-200 hover:border-pink-300 hover:bg-pink-50 hover:shadow-md active:scale-95',
    floating:
      'text-white bg-gradient-to-r from-pink-500 to-yellow-400 hover:from-pink-600 hover:to-yellow-500 rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95',
    auth: '',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm sm:text-base',
    lg: 'text-base sm:text-lg',
  };

  return (
    <Link
      href="/blog"
      className={cn(
        variant === 'auth' ? authBaseClasses : baseClasses,
        variant !== 'auth' && sizeClasses[size],
        variantClasses[variant],
        className
      )}
      aria-label="Voltar ao blog"
    >
      {variant === 'auth' ? (
        <>
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-500 to-yellow-400 flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
            <ArrowLeft className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-indigo-700 font-medium text-xs group-hover:text-pink-600 transition-colors whitespace-nowrap">
            Voltar ao blog
          </span>
        </>
      ) : (
        <>
          <ArrowLeft
            className={cn(
              iconSizes[size],
              'group-hover:-translate-x-0.5 transition-transform duration-200',
              'group-active:translate-x-0'
            )}
          />
          {showHomeIcon && (
            <Home
              className={cn(
                iconSizes[size],
                'opacity-60 group-hover:opacity-100 transition-opacity duration-200'
              )}
            />
          )}
          {showText && (
            <span
              className={cn('font-medium whitespace-nowrap', textSizes[size])}
            >
              Voltar ao blog
            </span>
          )}
        </>
      )}
    </Link>
  );
}
