import { requireAdminPage } from '@/lib/auth/adminPage';
import type { ReactNode } from 'react';

// LGPD correction requests: admins/DPO only (non-admins get a 404).
export default async function CorrectionRequestsLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAdminPage();
  return <>{children}</>;
}
