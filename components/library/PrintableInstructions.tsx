'use client';

import {
  AGE_LABELS,
  DIFFICULTY_LABELS,
  TYPE_LABELS,
  label,
  phonemeLabel,
} from '@/lib/activityLabels';
import type { LibraryActivity } from '@/lib/activityLibrary';
import { copyrightText } from '@/lib/copyright';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * Print sheet with an activity's instructions (its description), for the
 * therapist to keep next to the printed activity.
 *
 * Rendered straight into <body> and hidden on screen. printInstructions()
 * flags <body> so the print CSS in app/globals.css hides every other child
 * of <body> (the app and the open dialog) and only this sheet is printed.
 */

const PRINT_CLASS = 'printing-instructions';

export function printInstructions(): void {
  const body = document.body;
  body.classList.add(PRINT_CLASS);
  const done = () => {
    body.classList.remove(PRINT_CLASS);
    window.removeEventListener('afterprint', done);
  };
  window.addEventListener('afterprint', done);
  window.print();
}

export function PrintableInstructions({
  activity,
}: {
  activity: LibraryActivity;
}) {
  // document.body only exists in the browser.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const details = [
    activity.phoneme ? phonemeLabel(activity.phoneme) : null,
    label(TYPE_LABELS, activity.type),
    label(AGE_LABELS, activity.ageRange),
    label(DIFFICULTY_LABELS, activity.difficulty),
  ].filter(Boolean);

  return createPortal(
    <div className="print-instructions hidden bg-white p-0 text-black">
      <header className="flex items-center justify-between border-b border-neutral-300 pb-4">
        {/* Plain <img>: next/image is lazy and would not load while hidden. */}
        <img
          src="/images/logo-trimmed.png"
          alt="Almanaque da Fala"
          width={70}
          height={56}
          loading="eager"
          style={{ height: 56, width: 'auto' }}
        />
        <span className="text-sm text-neutral-700">
          Instruções da atividade
        </span>
      </header>

      <h1 className="mt-6 text-2xl font-bold">{activity.name}</h1>
      <p className="mt-1 text-sm text-neutral-700">{details.join(' · ')}</p>

      <h2 className="mt-8 text-lg font-semibold">Como usar</h2>
      <p className="mt-2 whitespace-pre-line text-base leading-relaxed">
        {activity.description}
      </p>

      <footer className="mt-12 border-t border-neutral-300 pt-3 text-center text-xs text-neutral-700">
        {copyrightText()}
      </footer>
    </div>,
    document.body
  );
}
