import type { ReactNode } from 'react';

// Colored header band of the signed-in pages (Painel, Perfil, Biblioteca),
// with soft shapes in the logo colors. `band` comes from
// components/library/tones.ts (TONES.<tone>.band).

export function PageHeader({
  band,
  eyebrow,
  title,
  description,
  actions,
  children,
}: {
  band: string;
  /** Small coral label above the title, e.g. "Painel". */
  eyebrow?: string;
  title?: ReactNode;
  description?: ReactNode;
  /** Right side (search, buttons). */
  actions?: ReactNode;
  /** Free content instead of / below the title block. */
  children?: ReactNode;
}) {
  return (
    <div className={`relative overflow-hidden border-b ${band}`}>
      <span
        className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-sun-300/40"
        aria-hidden
      />
      <span
        className="pointer-events-none absolute -bottom-16 right-48 h-32 w-32 rounded-full bg-coral-200/40"
        aria-hidden
      />
      <div className="relative px-6 py-7 sm:px-8">
        {(eyebrow || title || actions) && (
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              {eyebrow && (
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-coral-800">
                  {eyebrow}
                </p>
              )}
              {title && (
                <h1 className="mt-1 max-w-xl font-display text-2xl font-bold leading-tight text-violet-950 sm:text-3xl">
                  {title}
                </h1>
              )}
              {description && (
                <p className="mt-2 max-w-2xl text-sm text-neutral-600">
                  {description}
                </p>
              )}
            </div>
            {actions}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
