'use client';

import { LIBRARY_PATH } from '@/lib/libraryUrl';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';

/**
 * Landing-page library tile link. Signed-in users go straight to the topic
 * page in the dashboard; visitors go to sign-up and come back to it after.
 */
export default function LibraryTileLink({
  slug,
  className,
  children,
}: {
  slug: string;
  className?: string;
  children: React.ReactNode;
}) {
  const { isSignedIn } = useAuth();
  const topicPath = `${LIBRARY_PATH}/${slug}`;
  const href = isSignedIn
    ? topicPath
    : `/sign-up?redirect_url=${encodeURIComponent(topicPath)}`;
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
