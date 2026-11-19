'use client';

import { ActivityBrowser } from '@/components/library/ActivityBrowser';
import { LibraryHeader } from '@/components/library/LibraryHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { findTopic } from '@/lib/libraryTopics';
import { toneFor } from '@/components/library/tones';
import { LIBRARY_PATH } from '@/lib/libraryUrl';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';

// One topic of the library (a phoneme or a language topic): a paragraph about
// it and a grid of thumbnails. Clicking a thumbnail downloads the activity.

export default function LibraryTopicPage() {
  const { topic: slug } = useParams<{ topic: string }>();
  const topic = findTopic(slug);
  // Admin text for this topic (LibraryTopicContent), or the default.
  const { data: about, isLoading } = useQuery<string>({
    queryKey: ['library-topic', slug],
    enabled: !!topic,
    // Always re-read on open, so an admin's edit shows right away.
    staleTime: 0,
    refetchOnMount: 'always',
    queryFn: async () => {
      const res = await fetch(
        `/api/library/topics/${encodeURIComponent(slug)}`,
        { cache: 'no-store' }
      );
      const json: { success?: boolean; data?: { about: string } } = await res
        .json()
        .catch(() => ({}));
      if (!res.ok || !json.data) throw new Error('Falha ao carregar o texto');
      return json.data.about;
    },
  });
  if (!topic) notFound();

  return (
    <div className="h-full">
      <LibraryHeader band={toneFor(topic.groupId).band}>
        <Link
          href={LIBRARY_PATH}
          className="mb-3 inline-flex items-center gap-1 rounded-full bg-white/80 px-3 py-1 text-sm font-medium text-violet-950 shadow-sm hover:bg-white"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Biblioteca
        </Link>
        <h1 className="font-display text-2xl font-bold text-violet-950 sm:text-3xl">
          {topic.title}
        </h1>
        {isLoading ? (
          <div className="mt-2 max-w-2xl space-y-2" aria-hidden>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : (
          // On error the default text is shown.
          <p className="mt-2 max-w-2xl whitespace-pre-line text-sm leading-relaxed text-neutral-600">
            {about ?? topic.about}
          </p>
        )}
      </LibraryHeader>

      <div className="px-6 py-6">
        <ActivityBrowser
          filter={topic.filter}
          emptyText="Em breve: as atividades deste tema estão em produção."
        />
      </div>
    </div>
  );
}
