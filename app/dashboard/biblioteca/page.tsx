'use client';

import { NewActivityDialog } from '@/components/dialogs/new-activity-dialog';
import { ActivityBrowser } from '@/components/library/ActivityBrowser';
import { PageHeader } from '@/components/layout/PageHeader';
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
      <PageHeader
        band={TONES.sun.band}
        title="Biblioteca"
        description={
          isLoading || isError
            ? 'Escolha um fonema ou tema. Cada um tem atividades prontas para imprimir.'
            : `${total} ${total === 1 ? 'atividade pronta' : 'atividades prontas'} para imprimir. Escolha um fonema ou tema.`
        }
        actions={
          role === 'ADMIN' ? (
            <NewActivityDialog
              onSuccess={(name) => {
                setCreatedName(name || 'Atividade');
                queryClient.invalidateQueries({ queryKey: ['activities'] });
              }}
            />
          ) : undefined
        }
      >
        <div className="relative mt-6 max-w-md">
          <Search
            className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-600"
            aria-hidden
          />
          <Input
            type="search"
            placeholder="Buscar atividade"
            aria-label="Buscar atividade"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="h-12 rounded-2xl border-0 bg-white pl-10 pr-10 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-violet-950"
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
      </PageHeader>

      {createdName && (
        <div
          role="status"
          className="mx-4 mt-4 flex flex-col gap-2 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900 sm:flex-row sm:items-center sm:justify-between"
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
        <div className="m-4 rounded-3xl bg-white p-6">
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
        <div className="p-4">
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
