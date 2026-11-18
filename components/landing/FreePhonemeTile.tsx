'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FREE_SAMPLE_COUNT } from '@/lib/access-constants';
import { libraryHref } from '@/lib/libraryUrl';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import { useState } from 'react';
import ExampleWord from './ExampleWord';

export interface FreePreviewActivity {
  id: string;
  title: string;
  ageLabel: string;
  difficultyLabel: string;
  /** ActivityFile id of an image file, served via /api/free-preview/[fileId]. */
  imageFileId: string | null;
}

interface FreePhonemeTileProps {
  phoneme: string;
  count: number;
  activities: FreePreviewActivity[];
  /** Example word, target sound in brackets, e.g. "[s]apo". */
  example?: string;
}

export default function FreePhonemeTile({
  phoneme,
  count,
  activities,
  example,
}: FreePhonemeTileProps) {
  const [open, setOpen] = useState(false);
  const { isSignedIn } = useAuth();
  const label = `/${phoneme.toLowerCase()}/`;
  // Free samples are downloaded from the library after signing in; sign-up
  // returns the user there (redirect_url).
  const libraryUrl = libraryHref({ phoneme });
  const downloadHref = isSignedIn
    ? libraryUrl
    : `/sign-up?redirect_url=${encodeURIComponent(libraryUrl)}`;
  const sampleWord =
    activities.length === 1 ? 'uma atividade' : 'duas atividades';
  const countText = `${count} ${count === 1 ? 'atividade' : 'atividades'}`;
  // The badge says how many are free, so "10 atividades" doesn't read as "all free".
  const freeCount = Math.min(FREE_SAMPLE_COUNT, count);
  const badge = (
    <span className="rounded-sm bg-coral-700 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
      {freeCount} grátis
    </span>
  );

  const tileContent = (
    <>
      <span className="flex w-full items-start justify-between gap-2">
        <span className="font-mono text-base font-semibold text-neutral-900">
          {label}
        </span>
        {badge}
      </span>
      <span className="flex w-full items-end justify-between gap-2">
        {example ? (
          <ExampleWord
            word={example}
            className="font-display text-2xl font-bold text-neutral-900"
            decorationClass="decoration-coral-500"
          />
        ) : (
          <span />
        )}
        <span className="shrink-0 text-xs font-medium text-coral-800">
          {countText}
        </span>
      </span>
    </>
  );

  const tileClass =
    'group relative flex h-full w-full flex-col items-start justify-between gap-5 rounded-lg bg-coral-50 p-4 text-left ring-2 ring-inset ring-coral-500 transition-colors hover:bg-coral-100 focus-visible:outline-none focus-visible:ring-4';

  // Nothing to preview: fall back to the sign-up link.
  if (activities.length === 0) {
    return (
      <Link href={downloadHref} className={tileClass}>
        {tileContent}
      </Link>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-label={`Ver exemplos grátis do fonema ${label}`}
        className={tileClass}
      >
        {tileContent}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl font-bold text-neutral-900">
              {activities.length === 1 ? 'Uma atividade' : 'Duas atividades'} do{' '}
              {label}, grátis
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm leading-relaxed text-neutral-600">
            Veja {sampleWord} do fonema {label}.{' '}
            {isSignedIn
              ? 'Elas estão liberadas para você na biblioteca.'
              : 'Crie sua conta grátis para baixar e imprimir.'}{' '}
            As outras atividades fazem parte da assinatura.
          </p>

          <div className="mt-2 grid gap-4 sm:grid-cols-2">
            {activities.map((activity) => (
              <figure key={activity.id}>
                <div className="flex aspect-[3/4] items-center justify-center overflow-hidden rounded-sm border border-neutral-200 bg-white">
                  {activity.imageFileId ? (
                    // Plain <img>: the route redirects to a short-lived S3
                    // URL, which next/image would need remotePatterns for.

                    <img
                      src={`/api/free-preview/${activity.imageFileId}`}
                      alt={`Atividade ${activity.title}, fonema ${label}`}
                      loading="lazy"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="p-6 text-center">
                      <p className="font-mono text-sm font-semibold text-neutral-900">
                        {label}
                      </p>
                      <p className="mt-2 font-display text-xl font-bold text-neutral-900">
                        {activity.title}
                      </p>
                    </div>
                  )}
                </div>
                <figcaption className="mt-2 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">
                      {activity.title}
                    </p>
                    <p className="text-xs text-neutral-600">
                      {activity.ageLabel} · {activity.difficultyLabel}
                    </p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>

          <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
            <Link
              href="#planos"
              onClick={() => setOpen(false)}
              className="text-center text-sm font-medium text-neutral-700 underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-700"
            >
              Ver planos
            </Link>
            <Link
              href={downloadHref}
              className="rounded-md bg-neutral-900 px-5 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
            >
              {isSignedIn
                ? 'Baixar na biblioteca'
                : 'Criar conta e baixar grátis'}
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
