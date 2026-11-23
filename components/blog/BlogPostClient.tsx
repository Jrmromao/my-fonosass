'use client';

import LandingFooter from '@/components/layout/LandingFooter';
import SharedNavbar from '@/components/layout/SharedNavbar';
import { splitMarkdownForMidCta } from '@/lib/blog/splitForMidCta';
import { BlogPost } from '@/lib/blog';
import { safeJsonLd } from '@/lib/security/jsonLd';
import { sanitizeHtml } from '@/lib/security/sanitizeHtml';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft } from 'lucide-react';
import { marked } from 'marked';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import ConversionCTA from './ConversionCTA';
import LikeButton from './LikeButton';
import PopularPosts from './PopularPosts';
import ShareButton from './ShareButton';

const PROSE_CLASS =
  'prose prose-lg max-w-none ' +
  'prose-headings:font-display prose-headings:font-bold prose-headings:text-violet-950 ' +
  'prose-h2:mt-10 prose-h2:mb-4 prose-h2:border-b prose-h2:border-neutral-100 prose-h2:pb-2 prose-h2:text-2xl ' +
  'prose-h3:mt-8 prose-h3:mb-3 prose-h3:text-xl ' +
  'prose-p:text-base prose-p:leading-relaxed prose-p:text-neutral-700 ' +
  'prose-a:font-medium prose-a:text-coral-800 prose-a:no-underline hover:prose-a:underline ' +
  'prose-strong:font-semibold prose-strong:text-neutral-900 ' +
  'prose-code:rounded-md prose-code:bg-violet-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-code:text-coral-800 prose-code:before:content-none prose-code:after:content-none ' +
  'prose-pre:rounded-xl prose-pre:bg-neutral-900 prose-pre:text-neutral-100 ' +
  'prose-blockquote:border-l-4 prose-blockquote:border-coral-500 prose-blockquote:bg-violet-50 prose-blockquote:py-1 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-neutral-600 ' +
  'prose-li:text-neutral-700 ' +
  'prose-img:rounded-xl prose-img:border prose-img:border-neutral-200 ' +
  'prose-hr:border-neutral-100';

interface BlogPostClientProps {
  post: BlogPost;
  relatedPosts: BlogPost[];
}

export default function BlogPostClient({
  post,
  relatedPosts,
}: BlogPostClientProps) {
  const [readingProgress, setReadingProgress] = useState(0);
  const [viewCount, setViewCount] = useState(0);
  const [likeCount, setLikeCount] = useState(0);

  const wordCount = useMemo(
    () => post.content.split(/\s+/).length,
    [post.content]
  );

  const { beforeHtml, afterHtml } = useMemo(() => {
    marked.setOptions({ breaks: true, gfm: true });
    const { before, after } = splitMarkdownForMidCta(post.content);
    return {
      beforeHtml: sanitizeHtml(marked(before) as string),
      afterHtml: after ? sanitizeHtml(marked(after) as string) : '',
    };
  }, [post.content]);

  const handleLikeChange = useCallback((likes: number) => {
    setLikeCount(likes);
  }, []);

  useEffect(() => {
    const trackView = async () => {
      try {
        const response = await fetch(`/api/blog/${post.slug}/view`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ipAddress: null,
            userAgent: navigator.userAgent,
            referer: document.referrer,
          }),
        });
        if (response.ok) {
          const data = await response.json();
          setViewCount(data.viewCount);
        }
      } catch (error) {
        console.error('Error tracking view:', error);
      }
    };

    const loadAnalytics = async () => {
      try {
        const response = await fetch(`/api/blog/${post.slug}/view`);
        if (response.ok) {
          const data = await response.json();
          setViewCount(data.viewCount);
        }
        const likeResponse = await fetch(`/api/blog/${post.slug}/like`);
        if (likeResponse.ok) {
          const likeData = await likeResponse.json();
          setLikeCount(likeData.likeCount);
        }
      } catch (error) {
        console.error('Error loading analytics:', error);
      }
    };

    loadAnalytics().then(() => {
      setTimeout(trackView, 100);
    });
  }, [post.slug]);

  useEffect(() => {
    const handleScroll = () => {
      const article = document.querySelector('article[data-blog-article]');
      if (!article) return;
      const el = article as HTMLElement;
      const articleTop = el.offsetTop;
      const articleHeight = el.offsetHeight;
      const windowHeight = window.innerHeight;
      const scrollTop = window.scrollY;
      const progress = Math.min(
        100,
        Math.max(
          0,
          ((scrollTop - articleTop + windowHeight) / articleHeight) * 100
        )
      );
      setReadingProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: post.title,
            description: post.excerpt,
            author: {
              '@type': 'Person',
              name: post.author,
              jobTitle: 'Fonoaudióloga',
            },
            publisher: {
              '@type': 'Organization',
              name: 'Almanaque da Fala',
              url: 'https://www.almanaquedafala.com.br',
            },
            datePublished: post.date,
            dateModified: post.date,
            wordCount,
            timeRequired: `PT${post.readingTime}M`,
            keywords: post.tags?.join(', '),
            articleSection: 'Fonoaudiologia',
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': `https://www.almanaquedafala.com.br/blog/${post.slug}`,
            },
          }),
        }}
      />

      <div className="min-h-screen bg-violet-100 text-violet-950">
        <div
          className="fixed left-0 top-0 z-[60] h-1 w-full bg-violet-200"
          aria-hidden
        >
          <div
            className="h-full bg-coral-700 transition-[width] duration-300"
            style={{ width: `${readingProgress}%` }}
          />
        </div>

        <SharedNavbar tone="lavender" />

        <main id="main-content" className="pt-24 pb-16 md:pt-28 md:pb-20">
          <div className="mx-auto max-w-6xl px-6">
            <Link
              href="/blog"
              className="mb-6 inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-violet-950 shadow-sm hover:bg-violet-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-700 focus-visible:ring-offset-2"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
              Blog
            </Link>

            <div className="grid gap-6 lg:grid-cols-4 lg:gap-8">
              <article
                data-blog-article
                className="lg:col-span-3"
                itemScope
                itemType="https://schema.org/Article"
              >
                <header className="rounded-3xl bg-white p-6 sm:p-8">
                  <h1
                    className="font-display text-3xl font-bold leading-tight sm:text-4xl"
                    itemProp="headline"
                  >
                    {post.title}
                  </h1>
                  <p
                    className="mt-4 max-w-3xl text-base leading-relaxed text-neutral-600 sm:text-lg"
                    itemProp="description"
                  >
                    {post.excerpt}
                  </p>

                  <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-neutral-600">
                    <span
                      className="font-medium text-neutral-900"
                      itemProp="author"
                      itemScope
                      itemType="https://schema.org/Person"
                    >
                      <span itemProp="name">{post.author}</span>
                    </span>
                    <span aria-hidden>·</span>
                    <time itemProp="datePublished" dateTime={post.date}>
                      {format(new Date(post.date), "dd 'de' MMMM 'de' yyyy", {
                        locale: ptBR,
                      })}
                    </time>
                    <span aria-hidden>·</span>
                    <span
                      itemProp="timeRequired"
                      content={`PT${post.readingTime}M`}
                    >
                      {post.readingTime} min
                    </span>
                    {viewCount > 0 && (
                      <>
                        <span aria-hidden>·</span>
                        <span>
                          {viewCount.toLocaleString('pt-BR')} leituras
                        </span>
                      </>
                    )}
                  </div>

                  {post.tags && post.tags.length > 0 && (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <Link
                          key={tag}
                          href="/blog"
                          className="rounded-md bg-violet-50 px-2.5 py-1 text-xs font-medium text-neutral-700 hover:bg-sun-100"
                        >
                          {tag}
                        </Link>
                      ))}
                    </div>
                  )}

                  <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-neutral-100 pt-5">
                    <LikeButton
                      articleId={post.slug}
                      initialLikes={likeCount}
                      onLikeChange={(likes) => handleLikeChange(likes)}
                    />
                    <ShareButton
                      url={`/blog/${post.slug}`}
                      title={post.title}
                      description={post.excerpt}
                    />
                  </div>
                </header>

                <div className="mt-6 rounded-3xl bg-white p-6 sm:p-8">
                  <div itemProp="articleBody">
                    <div
                      className={PROSE_CLASS}
                      dangerouslySetInnerHTML={{ __html: beforeHtml }}
                    />

                    {afterHtml ? (
                      <ConversionCTA variant="mid" className="my-10" />
                    ) : null}

                    {afterHtml ? (
                      <div
                        className={PROSE_CLASS}
                        dangerouslySetInnerHTML={{ __html: afterHtml }}
                      />
                    ) : null}
                  </div>

                  <ConversionCTA variant="article" className="mt-10" />
                </div>
              </article>

              <aside className="space-y-4 lg:col-span-1">
                <div className="rounded-3xl bg-white p-5">
                  <h2 className="text-sm font-semibold text-violet-950">
                    Neste artigo
                  </h2>
                  <dl className="mt-4 space-y-3 text-sm">
                    <div className="flex justify-between gap-3">
                      <dt className="text-neutral-600">Leitura</dt>
                      <dd className="font-medium text-neutral-900">
                        {post.readingTime} min
                      </dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-neutral-600">Palavras</dt>
                      <dd className="font-medium text-neutral-900">
                        {wordCount.toLocaleString('pt-BR')}
                      </dd>
                    </div>
                    <div className="border-t border-neutral-100 pt-3">
                      <div className="mb-2 flex justify-between text-xs">
                        <span className="text-neutral-600">Progresso</span>
                        <span className="font-medium text-neutral-900">
                          {Math.round(readingProgress)}%
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-violet-100">
                        <div
                          className="h-2 rounded-full bg-coral-700 transition-[width] duration-300"
                          style={{ width: `${readingProgress}%` }}
                        />
                      </div>
                    </div>
                  </dl>
                </div>

                <div className="hidden lg:block">
                  <PopularPosts limit={5} sortBy="engagement" />
                </div>

                {relatedPosts.length > 0 && (
                  <div className="rounded-3xl bg-white p-5">
                    <h2 className="text-sm font-semibold text-violet-950">
                      Relacionados
                    </h2>
                    <ul className="mt-4 space-y-3">
                      {relatedPosts.slice(0, 3).map((related) => (
                        <li key={related.slug}>
                          <Link
                            href={`/blog/${related.slug}`}
                            className="block rounded-xl p-2 transition-colors hover:bg-violet-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-700"
                          >
                            <span className="text-sm font-medium leading-snug text-neutral-900">
                              {related.title}
                            </span>
                            <span className="mt-1 line-clamp-2 block text-xs text-neutral-600">
                              {related.excerpt}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </aside>
            </div>
          </div>
        </main>

        <LandingFooter />
      </div>
    </>
  );
}
