'use client';

import LandingFooter from '@/components/layout/LandingFooter';
import SharedNavbar from '@/components/layout/SharedNavbar';
import { BlogPost } from '@/lib/blog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

const PAGE_SIZE = 5;

interface BlogPageClientProps {
  articles: BlogPost[];
}

function blogHref({
  tag,
  page,
}: {
  tag?: string | null;
  page?: number;
}): string {
  const params = new URLSearchParams();
  if (tag) params.set('tag', tag);
  if (page && page > 1) params.set('page', String(page));
  const qs = params.toString();
  return qs ? `/blog?${qs}` : '/blog';
}

export default function BlogPageClient({ articles }: BlogPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedTag = searchParams.get('tag');
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

  const allTags = useMemo(
    () => Array.from(new Set(articles.flatMap((a) => a.tags || []))).sort(),
    [articles]
  );

  const filtered = useMemo(
    () =>
      selectedTag
        ? articles.filter((a) => a.tags?.includes(selectedTag))
        : articles,
    [articles, selectedTag]
  );

  // Featured only on page 1 of the unfiltered (or matching) list.
  const featured =
    page === 1 ? (filtered.find((a) => a.featured) ?? null) : null;
  const list = filtered.filter((a) => a.slug !== featured?.slug);

  const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const pageItems = list.slice(start, start + PAGE_SIZE);

  const goPage = (next: number) => {
    router.push(blogHref({ tag: selectedTag, page: next }));
    // Keep the list in view after pagination.
    if (typeof window !== 'undefined') {
      const el = document.getElementById('artigos');
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-violet-100 text-violet-950">
      <SharedNavbar tone="lavender" />

      <main id="main-content">
        <section className="border-b border-violet-200 pt-28 pb-12 md:pt-32 md:pb-16">
          <div className="mx-auto max-w-6xl px-6">
            <p className="text-sm font-medium text-neutral-600">Blog</p>
            <h1 className="mt-2 font-display text-3xl font-bold leading-tight md:text-4xl">
              Artigos para a prática clínica
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-neutral-600 md:text-lg">
              Fonemas, exercícios e orientação para fonoaudiólogos que atendem
              crianças. Materiais alinhados à biblioteca do Almanaque da Fala.
            </p>

            {allTags.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2">
                <Link
                  href={blogHref({ tag: null })}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-700 focus-visible:ring-offset-2 ${
                    !selectedTag
                      ? 'bg-neutral-900 text-white'
                      : 'bg-white text-neutral-700 ring-1 ring-neutral-200 hover:bg-violet-50'
                  }`}
                >
                  Todos
                </Link>
                {allTags.map((tag) => (
                  <Link
                    key={tag}
                    href={blogHref({ tag })}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-700 focus-visible:ring-offset-2 ${
                      selectedTag === tag
                        ? 'bg-sun-300 text-violet-950'
                        : 'bg-white text-neutral-700 ring-1 ring-neutral-200 hover:bg-violet-50'
                    }`}
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="border-t border-violet-200 bg-violet-50 py-12 md:py-16">
          <div className="mx-auto max-w-6xl space-y-6 px-6">
            {featured && (
              <article className="rounded-3xl bg-white p-6 sm:p-8">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-neutral-600">
                  <span className="font-medium text-neutral-900">
                    {featured.author}
                  </span>
                  <span aria-hidden>·</span>
                  <time dateTime={featured.date}>
                    {format(new Date(featured.date), "dd 'de' MMMM 'de' yyyy", {
                      locale: ptBR,
                    })}
                  </time>
                  <span aria-hidden>·</span>
                  <span>{featured.readingTime} min</span>
                </div>
                <h2 className="mt-3 font-display text-2xl font-bold leading-tight sm:text-3xl">
                  <Link
                    href={`/blog/${featured.slug}`}
                    className="hover:text-coral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-700 focus-visible:ring-offset-2"
                  >
                    {featured.title}
                  </Link>
                </h2>
                <p className="mt-3 max-w-3xl leading-relaxed text-neutral-600">
                  {featured.excerpt}
                </p>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    {featured.tags?.slice(0, 3).map((tag) => (
                      <Link
                        key={tag}
                        href={blogHref({ tag })}
                        className="rounded-md bg-violet-50 px-2.5 py-1 text-xs font-medium text-neutral-700 hover:bg-sun-100"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                  <Link
                    href={`/blog/${featured.slug}`}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-coral-800 underline decoration-coral-200 underline-offset-4 hover:decoration-coral-800"
                  >
                    Ler artigo{' '}
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </Link>
                </div>
              </article>
            )}

            <div id="artigos" className="rounded-3xl bg-white p-6 sm:p-8">
              <div className="mb-6 flex items-center justify-between gap-3">
                <h2 className="text-sm font-medium text-neutral-600">
                  {selectedTag
                    ? `Artigos sobre ${selectedTag}`
                    : 'Todos os artigos'}
                  {list.length > 0 && (
                    <span className="ml-2 text-neutral-500">
                      ({list.length})
                    </span>
                  )}
                </h2>
                {selectedTag && (
                  <Link
                    href="/blog"
                    className="text-xs font-semibold text-neutral-700 underline underline-offset-2 hover:text-neutral-900"
                  >
                    Limpar filtro
                  </Link>
                )}
              </div>

              {pageItems.length === 0 && !featured ? (
                <p className="py-8 text-center text-sm text-neutral-600">
                  {selectedTag
                    ? `Não há artigos sobre “${selectedTag}” no momento.`
                    : 'Não há artigos publicados ainda.'}
                </p>
              ) : pageItems.length === 0 ? (
                <p className="py-4 text-center text-sm text-neutral-600">
                  Não há mais artigos nesta página.
                </p>
              ) : (
                <ul className="divide-y divide-neutral-100">
                  {pageItems.map((article) => (
                    <li
                      key={article.slug}
                      className="py-6 first:pt-0 last:pb-0"
                    >
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-neutral-600">
                        <span className="font-medium text-neutral-900">
                          {article.author}
                        </span>
                        <span aria-hidden>·</span>
                        <time dateTime={article.date}>
                          {format(new Date(article.date), "dd 'de' MMMM", {
                            locale: ptBR,
                          })}
                        </time>
                        <span aria-hidden>·</span>
                        <span>{article.readingTime} min</span>
                      </div>
                      <h3 className="mt-2 font-display text-lg font-bold leading-snug">
                        <Link
                          href={`/blog/${article.slug}`}
                          className="hover:text-coral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-700 focus-visible:ring-offset-2"
                        >
                          {article.title}
                        </Link>
                      </h3>
                      <p className="mt-1.5 line-clamp-2 text-sm text-neutral-600">
                        {article.excerpt}
                      </p>
                      {article.tags && article.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {article.tags.slice(0, 3).map((tag) => (
                            <Link
                              key={tag}
                              href={blogHref({ tag })}
                              className="rounded-md bg-violet-50 px-2 py-0.5 text-xs font-medium text-neutral-700 hover:bg-sun-100"
                            >
                              {tag}
                            </Link>
                          ))}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}

              {totalPages > 1 && (
                <nav
                  className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 pt-6"
                  aria-label="Paginação do blog"
                >
                  <button
                    type="button"
                    onClick={() => goPage(safePage - 1)}
                    disabled={safePage <= 1}
                    className="inline-flex items-center gap-1 rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-700 focus-visible:ring-offset-2"
                  >
                    <ChevronLeft className="h-4 w-4" aria-hidden />
                    Anterior
                  </button>
                  <p className="text-sm text-neutral-600">
                    Página{' '}
                    <span className="font-semibold text-neutral-900">
                      {safePage}
                    </span>{' '}
                    de {totalPages}
                  </p>
                  <button
                    type="button"
                    onClick={() => goPage(safePage + 1)}
                    disabled={safePage >= totalPages}
                    className="inline-flex items-center gap-1 rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-700 focus-visible:ring-offset-2"
                  >
                    Seguinte
                    <ChevronRight className="h-4 w-4" aria-hidden />
                  </button>
                </nav>
              )}
            </div>

            <aside className="rounded-3xl border-2 border-neutral-900 bg-white p-7 md:p-9">
              <h2 className="font-display text-xl font-bold">
                Atividades prontas para imprimir
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-neutral-600">
                Materiais de apoio à terapia, organizados por fonema, criados e
                revisados por fonoaudióloga.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/#biblioteca"
                  className="inline-flex items-center rounded-md bg-coral-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-coral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-700 focus-visible:ring-offset-2"
                >
                  Ver a biblioteca
                </Link>
                <Link
                  href="/#planos"
                  className="inline-flex items-center rounded-md border border-neutral-200 bg-white px-5 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-700 focus-visible:ring-offset-2"
                >
                  Ver planos
                </Link>
              </div>
            </aside>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
