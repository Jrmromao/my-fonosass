import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';

// logo-trimmed.png is logo.png without its transparent padding (338x269),
// so the artwork fills the box it is given.
const SRC = '/images/logo-trimmed.png';
const RATIO = 338 / 269;

const HEIGHTS = {
  sm: 40,
  md: 52,
  // 80px navbar (SharedNavbar h-20), 4px above and below.
  nav: 72,
  // Collapsed dashboard sidebar (w-16).
  icon: 38,
  lg: 88,
} as const;

interface LogoProps {
  size?: keyof typeof HEIGHTS;
  href?: string | null;
  className?: string;
  priority?: boolean;
}

export function Logo({
  size = 'md',
  href = '/',
  className,
  priority = false,
}: LogoProps) {
  const height = HEIGHTS[size];
  const img = (
    <Image
      src={SRC}
      alt="Almanaque da Fala"
      width={Math.round(height * RATIO)}
      height={height}
      priority={priority}
      className={cn('block h-auto', className)}
      style={{ height, width: 'auto' }}
    />
  );

  return href ? (
    <Link href={href} aria-label="Almanaque da Fala, página inicial">
      {img}
    </Link>
  ) : (
    img
  );
}
