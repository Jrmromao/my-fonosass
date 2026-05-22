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
    <div className="border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="px-8 py-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white font-display">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {description}
            </p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
    </div>
  );
}
