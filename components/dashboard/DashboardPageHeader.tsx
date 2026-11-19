'use client';

import { ReactNode } from 'react';

interface DashboardPageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function DashboardPageHeader({
  title,
  description,
  action,
}: DashboardPageHeaderProps) {
  return (
    <div className="border-b border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900">
      <div className="px-8 py-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-violet-950 dark:text-white font-display">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-0.5">
              {description}
            </p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
    </div>
  );
}
