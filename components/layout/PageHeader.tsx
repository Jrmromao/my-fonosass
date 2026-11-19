import type { ReactNode } from 'react';

// Header banner of the signed-in pages ("Lúdico refinado", chosen by Eliane
// in /estilos): a rounded block in a logo color with two soft shapes, big
// rounded title. `band` comes from components/library/tones.ts
// (TONES.<tone>.band): sun for Painel, Perfil and Biblioteca, the group's
// color for each topic page.

export function PageHeader({
  band,
  title,
  description,
  actions,
  children,
}: {
  band: string;
  title?: ReactNode;
  description?: ReactNode;
  /** Right side or below (search, buttons). */
  actions?: ReactNode;
  /** Free content instead of / below the title block. */
  children?: ReactNode;
}) {
  return (
    <div className="px-4 pt-4">
      <div
        className={`relative overflow-hidden rounded-3xl px-6 py-8 sm:px-8 sm:py-10 ${band}`}
      >
        <span
          className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-white/35"
          aria-hidden
        />
        <span
          className="pointer-events-none absolute -bottom-16 right-40 h-32 w-32 rounded-full bg-coral-300/50"
          aria-hidden
        />
        <div className="relative">
          {(title || actions) && (
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                {title && (
                  <h1 className="font-display text-3xl font-black leading-tight text-violet-950 sm:text-4xl">
                    {title}
                  </h1>
                )}
                {description && (
                  <p className="mt-2 max-w-xl text-violet-950/80">
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
    </div>
  );
}
