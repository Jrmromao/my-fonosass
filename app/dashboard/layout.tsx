'use client';

import { Sidebar } from '@/components/layout/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950 overflow-x-hidden">
      <Sidebar />

      <main className="flex-1 overflow-x-hidden min-w-0">{children}</main>
    </div>
  );
}
