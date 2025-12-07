'use client';

import { useAccessibilityAudit } from '@/lib/accessibility';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
import { useState } from 'react';

interface AccessibilityAuditProps {
  className?: string;
}

export default function AccessibilityAudit({
  className = '',
}: AccessibilityAuditProps) {
  const { issues, isRunning, runAudit, errors, warnings, infos } =
    useAccessibilityAudit();
  const [isOpen, setIsOpen] = useState(false);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        aria-label="Toggle accessibility audit panel"
      >
        <AlertTriangle className="w-5 h-5" />
      </button>

      {/* Audit Panel */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-96 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Accessibility Audit
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
                aria-label="Close audit panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-4">
            <button
              onClick={runAudit}
              disabled={isRunning}
              className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {isRunning ? 'Running Audit...' : 'Run Accessibility Audit'}
            </button>

            {issues.length > 0 && (
              <div className="mt-4 space-y-3">
                {/* Summary */}
                <div className="flex items-center gap-4 text-sm">
                  {errors.length > 0 && (
                    <div className="flex items-center gap-1 text-red-600">
                      <X className="w-4 h-4" />
                      <span>{errors.length} errors</span>
                    </div>
                  )}
                  {warnings.length > 0 && (
                    <div className="flex items-center gap-1 text-yellow-600">
                      <AlertTriangle className="w-4 h-4" />
                      <span>{warnings.length} warnings</span>
                    </div>
                  )}
                  {infos.length > 0 && (
                    <div className="flex items-center gap-1 text-blue-600">
                      <Info className="w-4 h-4" />
                      <span>{infos.length} info</span>
                    </div>
                  )}
                </div>

                {/* Issues List */}
                <div className="space-y-2">
                  {errors.map((issue, index) => (
                    <div
                      key={index}
                      className="p-3 bg-red-50 border border-red-200 rounded-md"
                    >
                      <div className="flex items-start gap-2">
                        <X className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm text-red-800 font-medium">
                            {issue.message}
                          </p>
                          {issue.selector && (
                            <p className="text-xs text-red-600 mt-1 font-mono">
                              {issue.selector}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {warnings.map((issue, index) => (
                    <div
                      key={index}
                      className="p-3 bg-yellow-50 border border-yellow-200 rounded-md"
                    >
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm text-yellow-800 font-medium">
                            {issue.message}
                          </p>
                          {issue.selector && (
                            <p className="text-xs text-yellow-600 mt-1 font-mono">
                              {issue.selector}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {infos.map((issue, index) => (
                    <div
                      key={index}
                      className="p-3 bg-blue-50 border border-blue-200 rounded-md"
                    >
                      <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm text-blue-800 font-medium">
                            {issue.message}
                          </p>
                          {issue.selector && (
                            <p className="text-xs text-blue-600 mt-1 font-mono">
                              {issue.selector}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {issues.length === 0 && !isRunning && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <p className="text-sm text-green-800 font-medium">
                    No accessibility issues found!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
