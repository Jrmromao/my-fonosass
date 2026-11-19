'use client';

import { NewActivityDialog } from '@/components/dialogs/new-activity-dialog';
import { ActivityBrowser } from '@/components/library/ActivityBrowser';
import { LibraryHeader } from '@/components/library/LibraryHeader';
import { LibraryTopicGroups } from '@/components/library/LibraryTopicGroups';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useDebounce } from '@/hooks/use-debounce';
import { useUserRole } from '@/hooks/useUserRole';
import type { LibraryCountsResponse } from '@/lib/activityLibrary';
import { TONES } from '@/components/library/tones';
import {
  LIBRARY_PATH,
  parseLibraryParams,
  phonemeSlug,
} from '@/lib/libraryUrl';
import { LANGUAGE_TOPICS } from '@/lib/phonemes';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

// Library index: every phoneme and language topic, like the landing page.
// A tile leads to /dashboard/biblioteca/[topic] with that topic's activities.
// The search box (?busca=) swaps the tiles for matching activities.

export default function LibraryIndexPage() {
  const queryClient = useQueryClient();
  // UI hint only; createActivity is enforced as admin-only on the server.
  const { role } = useUserRole();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [createdName, setCreatedName] = useState<string | null>(null);

  // Old links (?fonema=s, ?phoneme=S) lead to the topic page.
  const { filters: legacyFilters } = parseLibraryParams(
    new URLSearchParams(searchParams.toString())
  );
  const redirectTo = legacyFilters.phoneme
    ? `${LIBRARY_PATH}/${phonemeSlug(legacyFilters.phoneme)}`
    : (() => {
        const topic = LANGUAGE_TOPICS.find((t) =>
          t.types.includes(legacyFilters.type as never)
        );
        return topic ? `${LIBRARY_PATH}/${topic.id}` : null;
      })();
  useEffect(() => {
    if (redirectTo) router.replace(redirectTo);
  }, [redirectTo, router]);

  // Search lives in the URL so "voltar" keeps the results.
  const search = legacyFilters.search.trim();
  const [searchInput, setSearchInput] = useState(search);
  const debounced = useDebounce(searchInput, 400);
  useEffect(() => {
    const next = debounced.trim();
    if (next === search) return;
    const href = next
      ? `${LIBRARY_PATH}?busca=${encodeURIComponent(next)}`
      : LIBRARY_PATH;
    router.replace(href, { scroll: false });
    // Only react to the debounced value.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  const { data, isLoading, isError, refetch } = useQuery<LibraryCountsResponse>(
    {
      queryKey: ['activities', 'counts'],
      queryFn: async () => {
        const res = await fetch('/api/library/counts');
        const json: LibraryCountsResponse = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || 'Falha ao carregar a biblioteca');
        }
        return json;
      },
    }
  );

  const phonemeCounts = data?.data?.phonemes ?? {};
  const typeCounts = data?.data?.types ?? {};
  const total = data?.data?.total ?? 0;

  return (
    <div className="h-full">
      <LibraryHeader band={TONES.cream.band}>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-coral-800">
              Biblioteca
            </p>
            <h1 className="mt-1 max-w-xl font-display text-2xl font-bold leading-tight text-violet-950 sm:text-3xl">
              {isLoading || isError
                ? 'Atividades organizadas por fonema e tema'
                : `${total} ${total === 1 ? 'atividade' : 'atividades'}, organizadas por fonema e tema`}
            </h1>
          </div>
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center lg:w-auto">
            <div className="relative w-full sm:w-80">
              <Search
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-600"
                aria-hidden
              />
              <Input
                type="search"
                placeholder="Buscar atividade pelo nome"
                aria-label="Buscar atividade"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="h-11 rounded-full border-cream-300 bg-white pl-9 pr-9 text-sm shadow-sm"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput('')}
                  aria-label="Limpar busca"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-neutral-600 hover:text-neutral-900"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              )}
            </div>
            {role === 'ADMIN' && (
              <NewActivityDialog
                onSuccess={(name) => {
                  setCreatedName(name || 'Atividade');
                  queryClient.invalidateQueries({ queryKey: ['activities'] });
                }}
              />
            )}
          </div>
        </div>
      </LibraryHeader>

      {createdName && (
        <div
          role="status"
          className="mx-6 mt-4 flex flex-col gap-2 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900 sm:flex-row sm:items-center sm:justify-between"
        >
          <p>
            &ldquo;{createdName}&rdquo; foi criada e está aguardando revisão.
            Ela aparece na biblioteca depois de aprovada.
          </p>
          <div className="flex shrink-0 items-center gap-3">
            <Link
              href="/dashboard/resources?tab=review"
              className="font-semibold underline underline-offset-2"
            >
              Ir para Revisão
            </Link>
            <button
              type="button"
              onClick={() => setCreatedName(null)}
              className="text-green-900"
              aria-label="Fechar aviso"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {search ? (
        <div className="px-6 py-6">
          <h2 className="mb-1 font-display text-lg font-bold text-violet-950">
            Resultados para &ldquo;{search}&rdquo;
          </h2>
          <ActivityBrowser
            filter={{ search }}
            showSubject
            emptyText="Nenhuma atividade encontrada. Tente outra palavra ou navegue pelos fonemas."
          />
        </div>
      ) : (
        <div className="px-4 py-5 sm:px-6">
          {isError ? (
            <div className="py-16 text-center text-sm text-neutral-600">
              <p>Não foi possível carregar a biblioteca.</p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-3 font-semibold underline underline-offset-2"
              >
                Tentar de novo
              </button>
            </div>
          ) : isLoading ? (
            <div className="space-y-5">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-48 w-full rounded-2xl" />
              ))}
            </div>
          ) : (
            <LibraryTopicGroups
              phonemeCounts={phonemeCounts}
              typeCounts={typeCounts}
            />
          )}
        </div>
      )}
    </div>
  );
}
