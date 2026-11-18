// Signed-in area: rendered per request so the CSP nonce from middleware.ts can
// be stamped on its scripts (public pages stay prerendered and cached).
export const dynamic = 'force-dynamic';

import { DashboardShell } from '@/components/layout/DashboardShell';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}
