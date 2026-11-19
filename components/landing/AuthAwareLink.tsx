'use client';

import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';

/**
 * Link to a signed-in page. Signed-in users go straight to `to`; visitors go
 * to sign-up and are sent to `to` afterwards.
 */
export default function AuthAwareLink({
  to,
  className,
  children,
}: {
  to: string;
  className?: string;
  children: React.ReactNode;
}) {
  const { isSignedIn } = useAuth();
  const href = isSignedIn
    ? to
    : `/sign-up?redirect_url=${encodeURIComponent(to)}`;
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
