import { PageHeader } from '@/components/layout/PageHeader';
import type { ReactNode } from 'react';

// Library pages use the shared colored header (components/layout/PageHeader).
export function LibraryHeader({
  band,
  children,
}: {
  band: string;
  children: ReactNode;
}) {
  return <PageHeader band={band}>{children}</PageHeader>;
}
