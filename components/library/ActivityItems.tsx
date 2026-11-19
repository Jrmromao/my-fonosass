'use client';

import ExampleWord from '@/components/landing/ExampleWord';
import { Button } from '@/components/ui/button';
import { TYPE_LABELS, label, phonemeLabel } from '@/lib/activityLabels';
import type { LibraryActivity } from '@/lib/activityLibrary';
import { exampleWordFor } from '@/lib/phonemes';
import { Download, Lock } from 'lucide-react';

// Library results: ActivityCard (grid) and ActivityRow (list).

/**
 * "Fonema /g/" for phonemes written in /x/ notation (mono); named entries
 * like "Arquifonema /S/" or "Encontro consonantal /r/" are shown as is.
 */
function PhonemeTitle({ code }: { code: string }) {
  const text = phonemeLabel(code);
  if (!text.startsWith('/')) return <>{text}</>;
  const [notation, ...rest] = text.split(' ');
  return (
    <>
      Fonema <span className="font-mono">{notation}</span>
      {rest.length > 0 && ` ${rest.join(' ')}`}
    </>
  );
}

export interface ActivityItemProps {
  activity: LibraryActivity;
  showFreeBadge: boolean;
  downloading: boolean;
  onOpen: () => void;
  onDownload: () => void;
  onUpgrade: () => void;
}

export function ActivityCard({
  activity,
  showFreeBadge,
  downloading,
  onOpen,
  onDownload,
  onUpgrade,
}: ActivityItemProps) {
  const example = exampleWordFor(activity.phoneme);
  const hasFile = activity.files.length > 0;

  return (
    <article className="flex h-full flex-col rounded-md border border-neutral-200 bg-white">
      <button
        type="button"
        onClick={onOpen}
        className="flex flex-1 flex-col text-left rounded-t-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-neutral-900"
        aria-label={`Ver detalhes de ${activity.name}`}
      >
        {/* Subject of the activity: the phoneme (with an example word, so
            "gato" reads as an example and not as the activity itself) or,
            for other categories, the category name. */}
        <div className="flex h-24 flex-col items-center justify-center gap-1 rounded-t-md bg-neutral-50 px-3 text-center">
          {activity.phoneme ? (
            <>
              <span className="text-lg font-bold text-neutral-900 font-display">
                <PhonemeTitle code={activity.phoneme} />
              </span>
              {example && (
                <span className="text-sm text-neutral-600">
                  como em{' '}
                  <ExampleWord
                    word={example}
                    decorationClass="decoration-coral-500"
                    className="font-semibold text-neutral-900"
                  />
                </span>
              )}
            </>
          ) : (
            <span className="text-lg font-bold text-neutral-900 font-display">
              {label(TYPE_LABELS, activity.type)}
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-1 p-4">
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-base font-semibold text-neutral-900">
              {activity.name}
            </h2>
            {activity.isFreeSample && showFreeBadge && (
              <span className="shrink-0 rounded-sm bg-coral-700 px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">
                Grátis
              </span>
            )}
          </div>
        </div>
      </button>
      {hasFile && (
        <div className="border-t border-neutral-100 p-3">
          {activity.canDownload ? (
            <Button
              variant="outline"
              size="sm"
              className="h-9 w-full border-neutral-300 text-sm font-semibold"
              onClick={onDownload}
              disabled={downloading}
            >
              <Download className="mr-2 h-4 w-4" aria-hidden />
              {downloading ? 'Baixando...' : 'Baixar'}
            </Button>
          ) : (
            <Button
              size="sm"
              className="h-9 w-full bg-coral-700 text-sm font-semibold text-white hover:bg-coral-800"
              onClick={onUpgrade}
            >
              <Lock className="mr-2 h-4 w-4" aria-hidden />
              Assinar para baixar
            </Button>
          )}
        </div>
      )}
    </article>
  );
}

function FreeBadge() {
  return (
    <span className="shrink-0 rounded-sm bg-coral-700 px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">
      Grátis
    </span>
  );
}

/** One line per activity: subject, name, action. */
export function ActivityRow({
  activity,
  showFreeBadge,
  downloading,
  onOpen,
  onDownload,
  onUpgrade,
}: ActivityItemProps) {
  const example = activity.phoneme ? exampleWordFor(activity.phoneme) : null;
  const hasFile = activity.files.length > 0;

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Ver detalhes de ${activity.name}`}
        className="flex min-w-0 flex-1 flex-col gap-1 rounded text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-neutral-900 sm:flex-row sm:items-center sm:gap-4"
      >
        <span className="w-44 shrink-0 text-sm">
          {activity.phoneme ? (
            <>
              <span className="font-semibold text-neutral-900">
                <PhonemeTitle code={activity.phoneme} />
              </span>
              {example && (
                <span className="text-neutral-600">
                  {' · '}
                  <ExampleWord
                    word={example}
                    decorationClass="decoration-coral-500"
                  />
                </span>
              )}
            </>
          ) : (
            <span className="font-semibold text-neutral-900">
              {label(TYPE_LABELS, activity.type)}
            </span>
          )}
        </span>
        <span className="flex min-w-0 flex-1 items-center gap-2">
          <span className="truncate text-sm font-medium text-neutral-900">
            {activity.name}
          </span>
          {activity.isFreeSample && showFreeBadge && <FreeBadge />}
        </span>
      </button>
      {hasFile &&
        (activity.canDownload ? (
          <Button
            variant="outline"
            size="sm"
            className="h-9 shrink-0 border-neutral-300 text-sm font-semibold"
            onClick={onDownload}
            disabled={downloading}
            aria-label={`Baixar ${activity.name}`}
          >
            <Download className="h-4 w-4 sm:mr-2" aria-hidden />
            <span className="hidden sm:inline">
              {downloading ? 'Baixando...' : 'Baixar'}
            </span>
          </Button>
        ) : (
          <Button
            size="sm"
            className="h-9 shrink-0 bg-coral-700 text-sm font-semibold text-white hover:bg-coral-800"
            onClick={onUpgrade}
            aria-label={`Assinar para baixar ${activity.name}`}
          >
            <Lock className="h-4 w-4 sm:mr-2" aria-hidden />
            <span className="hidden sm:inline">Assinar</span>
          </Button>
        ))}
    </div>
  );
}
