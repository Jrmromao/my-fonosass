'use client';

import { cn } from '@/lib/utils';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

interface BackToBlogButtonProps {
  variant?: 'default' | 'minimal' | 'enhanced' | 'floating' | 'auth';
  className?: string;
  showHomeIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

const sizeClasses = {
  sm: 'text-xs px-3 py-1.5',
  md: 'text-sm px-3 py-1.5',
  lg: 'text-sm px-4 py-2',
} as const;

/**
 * Back link to /blog. Variants kept for call-site compatibility; all render
 * the current lavender/coral template style.
 */
export default function BackToBlogButton({
  className,
  size = 'md',
  showText = true,
}: BackToBlogButtonProps) {
  return (
    <Link
      href="/blog"
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-white font-semibold text-violet-950 shadow-sm transition-colors hover:bg-violet-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-700 focus-visible:ring-offset-2',
        sizeClasses[size],
        className
      )}
      aria-label="Voltar ao blog"
    >
      <ChevronLeft className="h-4 w-4" aria-hidden />
      {showText && <span>Blog</span>}
    </Link>
  );
}
