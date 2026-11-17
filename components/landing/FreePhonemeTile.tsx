'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Download } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

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
}

export default function FreePhonemeTile({
  phoneme,
  count,
  activities,
}: FreePhonemeTileProps) {
  const [open, setOpen] = useState(false);
  const label = `/${phoneme.toLowerCase()}/`;

  const tileContent = (
    <>
      <span className="absolute right-2 top-2 rounded-sm bg-coral-700 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
        Grátis
      </span>
      <span className="font-mono text-2xl font-semibold text-neutral-900">
        {label}
      </span>
      <span className="text-xs font-medium text-coral-800">
        {count} {count === 1 ? 'atividade' : 'atividades'}
      </span>
    </>
  );

  const tileClass =
    'group relative flex h-full w-full flex-col items-start justify-between gap-6 bg-coral-50 p-4 text-left ring-2 ring-inset ring-coral-500 transition-colors hover:bg-coral-100 focus-visible:outline-none focus-visible:ring-4';

  // Nothing to preview: fall back to the sign-up link.
  if (activities.length === 0) {
    return (
      <Link href="/sign-up" className={tileClass}>
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
              Atividades do {label}, grátis
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm leading-relaxed text-neutral-600">
            {activities.some((a) => a.imageFileId)
              ? 'Baixe agora, sem cadastro:'
              : activities.length === 1
                ? 'Veja uma'
                : `Veja ${activities.length === 2 ? 'duas' : activities.length}`}{' '}
            {activities.some((a) => a.imageFileId)
              ? `${activities.length === 1 ? 'uma' : 'duas'} das ${count} atividades do fonema ${label}. Crie sua conta para baixar as outras.`
              : `das ${count} atividades do fonema ${label}. Crie sua conta para baixar todas, prontas para imprimir.`}
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
                  {activity.imageFileId && (
                    <a
                      href={`/api/free-preview/${activity.imageFileId}?download=1`}
                      download
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-semibold text-neutral-900 transition-colors hover:bg-neutral-50"
                    >
                      <Download size={14} aria-hidden />
                      Baixar
                    </a>
                  )}
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
              href="/sign-up"
              className="rounded-md bg-neutral-900 px-5 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
            >
              Criar conta e baixar grátis
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
