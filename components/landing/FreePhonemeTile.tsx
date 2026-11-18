'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LIBRARY_PATH, libraryHref } from '@/lib/libraryUrl';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import { useState } from 'react';
import ExampleWord from './ExampleWord';

/** One of this month's free activities, as shown on public pages. */
export interface FreePreviewActivity {
  id: string;
  title: string;
  /** Activity.phoneme ('' for non-phoneme categories). */
  phoneme: string;
  /** "Fonema /s/", "Arquifonema /S/", "Cores"… */
  subject: string;
  ageLabel: string;
  difficultyLabel: string;
  /** ActivityFile id of an image file, served via /api/free-preview/[fileId]. */
  imageFileId: string | null;
}

const countWord = (n: number) =>
  n === 1 ? 'uma atividade' : n === 2 ? 'duas atividades' : `${n} atividades`;

/** Preview of the free activities, with the sign-up/download CTA. */
export function FreeSamplesDialog({
  open,
  onOpenChange,
  activities,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activities: FreePreviewActivity[];
}) {
  const { isSignedIn } = useAuth();
  // Free samples are downloaded from the library after signing in; sign-up
  // returns the user there (redirect_url).
  const downloadHref = isSignedIn
    ? LIBRARY_PATH
    : `/sign-up?redirect_url=${encodeURIComponent(LIBRARY_PATH)}`;
  const word = countWord(activities.length);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-bold text-neutral-900">
            Atividades grátis
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm leading-relaxed text-neutral-600">
          {word === 'uma atividade'
            ? 'Esta atividade é grátis'
            : `Estas ${word} são grátis`}{' '}
          para quem tem conta.{' '}
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
                    alt={`Atividade ${activity.title}, ${activity.subject}`}
                    loading="lazy"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div className="p-6 text-center">
                    <p className="text-sm font-semibold text-neutral-900">
                      {activity.subject}
                    </p>
                    <p className="mt-2 font-display text-xl font-bold text-neutral-900">
                      {activity.title}
                    </p>
                  </div>
                )}
              </div>
              <figcaption className="mt-2">
                <p className="text-sm font-semibold text-neutral-900">
                  {activity.title}
                </p>
                <p className="text-xs text-neutral-600">
                  {activity.subject} · {activity.ageLabel} ·{' '}
                  {activity.difficultyLabel}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
          <Link
            href="#planos"
            onClick={() => onOpenChange(false)}
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
  );
}

/** Inline text button that opens the free-activities preview. */
export function FreeSamplesButton({
  activities,
  children,
  className,
}: {
  activities: FreePreviewActivity[];
  children: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className={className}
      >
        {children}
      </button>
      <FreeSamplesDialog
        open={open}
        onOpenChange={setOpen}
        activities={activities}
      />
    </>
  );
}

interface FreePhonemeTileProps {
  phoneme: string;
  count: number;
  /** All of this month's free activities (the dialog shows them all). */
  activities: FreePreviewActivity[];
  /** Example word, target sound in brackets, e.g. "[s]apo". */
  example?: string;
}

/** Phoneme tile highlighted because this month's free list includes it. */
export default function FreePhonemeTile({
  phoneme,
  count,
  activities,
  example,
}: FreePhonemeTileProps) {
  const [open, setOpen] = useState(false);
  const { isSignedIn } = useAuth();
  const label = `/${phoneme.toLowerCase()}/`;
  const libraryUrl = libraryHref({ phoneme });
  const downloadHref = isSignedIn
    ? libraryUrl
    : `/sign-up?redirect_url=${encodeURIComponent(libraryUrl)}`;
  const countText = `${count} ${count === 1 ? 'atividade' : 'atividades'}`;
  // The badge says how many of THIS phoneme are free, so "10 atividades"
  // doesn't read as "all free".
  const freeHere = activities.filter((a) => a.phoneme === phoneme).length;
  const badge = (
    <span className="rounded-sm bg-coral-700 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
      {freeHere} grátis
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
        aria-label={`Ver as atividades grátis (inclui ${label})`}
        className={tileClass}
      >
        {tileContent}
      </button>
      <FreeSamplesDialog
        open={open}
        onOpenChange={setOpen}
        activities={activities}
      />
    </>
  );
}
