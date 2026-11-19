import { requireAdminPage } from '@/lib/auth/adminPage';
import type { ReactNode } from 'react';

// Audit trail: admins only (non-admins get a 404).
export default async function AuditTrailLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAdminPage();
  return <>{children}</>;
}
