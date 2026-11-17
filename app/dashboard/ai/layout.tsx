import { requireAdminPage } from '@/lib/auth/adminPage';
import type { ReactNode } from 'react';

// Internal AI tools: admins only (non-admins get a 404).
export default async function AdminAiLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAdminPage();
  return <>{children}</>;
}
