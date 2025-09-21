'use client';

import LandingFooter from '@/components/layout/LandingFooter';
import { BlogPost } from '@/lib/blog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowLeft, ChevronLeft } from 'lucide-react';
import { marked } from 'marked';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import LikeButton from './LikeButton';
import ShareButton from './ShareButton';

interface BlogPostClientProps {
  post: BlogPost;
  relatedPosts: BlogPost[];
}

export default function BlogPostClient({
  post,
  relatedPosts,
}: BlogPostClientProps) {
  const [activeHeading, setActiveHeading] = useState<string>('');
  const [readingProgress, setReadingProgress] = useState(0);

  // Static values for better UX - use useMemo to ensure they don't change on re-renders
  const viewCount = useMemo(() => Math.floor(Math.random() * 1000) + 500, []); // Static view count
  const wordCount = useMemo(
    () => post.content.split(/\s+/).length,
    [post.content]
  );

  // Configure marked options
  marked.setOptions({
    breaks: true,
    gfm: true,
  });

  useEffect(() => {
    const handleScroll = () => {
      // Reading progress calculation
      const article = document.querySelector('article');
      if (article) {
        const articleTop = article.offsetTop;
        const articleHeight = article.offsetHeight;
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
      }

      // Active heading detection
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      let currentHeading = '';

      headings.forEach((heading) => {
        const rect = heading.getBoundingClientRect();
        if (rect.top <= 100) {
          currentHeading = heading.id;
        }
      });

      setActiveHeading(currentHeading);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!post) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Artigo não encontrado
          </h1>
          <Link
            href="/blog"
            className="text-pink-600 hover:text-pink-700 font-medium"
          >
            ← Voltar ao blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: post.title,
            description: post.excerpt,
            image: post.featured
              ? `/api/og?title=${encodeURIComponent(post.title)}`
              : undefined,
            author: {
              '@type': 'Person',
              name: post.author,
              jobTitle: 'Fonoaudióloga',
              description:
                'Especialista em fonoaudiologia com ampla experiência clínica',
            },
            publisher: {
              '@type': 'Organization',
              name: 'FonoSaaS',
              url: 'https://fonosaas.com',
            },
            datePublished: post.date,
            dateModified: post.date,
            wordCount: wordCount,
            timeRequired: `PT${post.readingTime}M`,
            keywords: post.tags?.join(', '),
            articleSection: 'Fonoaudiologia',
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': `https://fonosaas.com/blog/${post.slug}`,
            },
          }),
        }}
      />

      <div className="min-h-screen bg-white">
        {/* Reading Progress Bar */}
        <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
          <div
            className="h-full bg-gradient-to-r from-pink-500 to-yellow-400 transition-all duration-300"
            style={{ width: `${readingProgress}%` }}
          />
        </div>

        {/* Breadcrumb Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'BreadcrumbList',
              itemListElement: [
                {
                  '@type': 'ListItem',
                  position: 1,
                  name: 'Home',
                  item: 'https://fonosaas.com',
                },
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: 'Blog',
                  item: 'https://fonosaas.com/blog',
                },
                {
                  '@type': 'ListItem',
                  position: 3,
                  name: post.title,
                  item: `https://fonosaas.com/blog/${post.slug}`,
                },
              ],
            }),
          }}
        />

        {/* Header */}
        <header className="sticky top-1 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link
                href="/blog"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar ao blog
              </Link>

              <div className="flex items-center gap-4">
                <Link
                  href="/dashboard"
                  className="px-4 py-2 bg-gradient-to-r from-pink-500 to-yellow-400 text-white rounded-full text-sm font-medium hover:shadow-lg hover:shadow-pink-500/25 transition-all"
                >
                  Dashboard
                </Link>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <article
              className="lg:col-span-3"
              itemScope
              itemType="https://schema.org/Article"
            >
              {/* Enhanced Breadcrumb Navigation */}
              <nav className="mb-8" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-2 text-sm">
                  <li>
                    <Link
                      href="/"
                      className="text-gray-500 hover:text-pink-600 transition-colors duration-200 flex items-center gap-1"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                        />
                      </svg>
                      Home
                    </Link>
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="w-4 h-4 text-gray-300 mx-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <Link
                      href="/blog"
                      className="text-gray-500 hover:text-pink-600 transition-colors duration-200"
                    >
                      Blog
                    </Link>
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="w-4 h-4 text-gray-300 mx-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span
                      className="text-gray-900 font-medium truncate max-w-xs"
                      aria-current="page"
                    >
                      {post.title}
                    </span>
                  </li>
                </ol>
              </nav>

              {/* Enhanced Article Header */}
              <header className="mb-12">
                <div className="bg-gradient-to-br from-pink-50 via-white to-yellow-50 rounded-3xl p-8 border border-pink-100 shadow-sm">
                  <h1
                    className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight tracking-tight"
                    itemProp="headline"
                  >
                    {post.title}
                  </h1>

                  <p
                    className="text-xl text-gray-600 mb-8 leading-relaxed max-w-4xl"
                    itemProp="description"
                  >
                    {post.excerpt}
                  </p>

                  {/* Enhanced Author Info */}
                  <div className="flex flex-wrap items-center gap-6 text-sm mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-yellow-400 rounded-full flex items-center justify-center">
                        <svg
                          className="w-6 h-6 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                      <div>
                        <div
                          className="font-semibold text-gray-900"
                          itemProp="author"
                          itemScope
                          itemType="https://schema.org/Person"
                        >
                          <span itemProp="name">{post.author}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Especialista em Fonoaudiologia
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <time itemProp="datePublished" dateTime={post.date}>
                        {format(new Date(post.date), "dd 'de' MMMM 'de' yyyy", {
                          locale: ptBR,
                        })}
                      </time>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span
                        itemProp="timeRequired"
                        content={`PT${post.readingTime}M`}
                      >
                        {post.readingTime} min de leitura
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <span>{wordCount.toLocaleString()} palavras</span>
                    </div>
                  </div>

                  {/* Enhanced Tags */}
                  <div className="flex flex-wrap items-center gap-3 mb-8">
                    {post.tags &&
                      post.tags.map((tag) => (
                        <Link
                          key={tag}
                          href={`/blog?tag=${encodeURIComponent(tag)}`}
                          className="px-4 py-2 bg-gradient-to-r from-pink-100 to-yellow-100 text-pink-700 rounded-full text-sm font-medium hover:from-pink-200 hover:to-yellow-200 hover:scale-105 transition-all duration-200 border border-pink-200 shadow-sm"
                          aria-label={`Filtrar artigos por tag: ${tag}`}
                        >
                          #{tag}
                        </Link>
                      ))}
                  </div>

                  {/* Enhanced Social Actions */}
                  <div className="flex items-center justify-between p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-6">
                      <LikeButton
                        articleId={post.slug}
                        initialLikes={Math.floor(Math.random() * 100)}
                      />
                      <ShareButton
                        url={`/blog/${post.slug}`}
                        title={post.title}
                        description={post.excerpt}
                      />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="font-medium">
                        {viewCount.toLocaleString()} visualizações
                      </span>
                    </div>
                  </div>
                </div>
              </header>

              {/* Enhanced Article Content */}
              <div
                className="prose prose-xl max-w-none 
                prose-headings:text-gray-900 prose-headings:font-bold prose-headings:tracking-tight
                prose-h1:text-4xl prose-h1:mb-8 prose-h1:mt-12 prose-h1:bg-gradient-to-r prose-h1:from-pink-600 prose-h1:to-yellow-500 prose-h1:bg-clip-text prose-h1:text-transparent
                prose-h2:text-3xl prose-h2:mb-6 prose-h2:mt-10 prose-h2:border-b prose-h2:border-pink-200 prose-h2:pb-3 prose-h2:relative
                prose-h3:text-2xl prose-h3:mb-4 prose-h3:mt-8 prose-h3:text-gray-800
                prose-h4:text-xl prose-h4:mb-3 prose-h4:mt-6 prose-h4:text-gray-800
                prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6 prose-p:text-lg prose-p:font-normal
                prose-a:text-pink-600 prose-a:no-underline hover:prose-a:underline prose-a:font-medium prose-a:transition-all prose-a:duration-200
                prose-strong:text-gray-900 prose-strong:font-semibold
                prose-code:text-pink-600 prose-code:bg-gradient-to-r prose-code:from-pink-50 prose-code:to-yellow-50 prose-code:px-3 prose-code:py-1 prose-code:rounded-md prose-code:text-sm prose-code:font-mono prose-code:border prose-code:border-pink-200
                prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-xl prose-pre:p-6 prose-pre:overflow-x-auto prose-pre:shadow-lg prose-pre:border prose-pre:border-gray-700
                prose-blockquote:border-l-4 prose-blockquote:border-pink-500 prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-gray-600 prose-blockquote:bg-gradient-to-r prose-blockquote:from-pink-50 prose-blockquote:to-yellow-50 prose-blockquote:py-4 prose-blockquote:rounded-r-lg prose-blockquote:shadow-sm
                prose-ul:list-disc prose-ul:pl-6 prose-ul:space-y-3 prose-ul:marker:text-pink-500
                prose-ol:list-decimal prose-ol:pl-6 prose-ol:space-y-3 prose-ol:marker:text-pink-500 prose-ol:marker:font-bold
                prose-li:text-gray-700 prose-li:leading-relaxed prose-li:mb-2
                prose-img:rounded-xl prose-img:shadow-xl prose-img:mx-auto prose-img:border prose-img:border-gray-200
                prose-hr:border-gray-200 prose-hr:my-12 prose-hr:border-t-2"
                dangerouslySetInnerHTML={{ __html: marked(post.content) }}
                itemProp="articleBody"
              />
            </article>

            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Simple Reading Stats */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    Estatísticas
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tempo de leitura</span>
                      <span className="font-medium">
                        {post.readingTime} min
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Palavras</span>
                      <span className="font-medium">
                        {wordCount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Visualizações</span>
                      <span className="font-medium">
                        {viewCount.toLocaleString()}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-gray-200">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600">Progresso</span>
                        <span className="font-medium">
                          {Math.round(readingProgress)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-pink-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${readingProgress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Simple Related Posts */}
                {relatedPosts.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">
                      Artigos Relacionados
                    </h3>
                    <div className="space-y-3">
                      {relatedPosts.slice(0, 3).map((relatedPost) => (
                        <Link
                          key={relatedPost.slug}
                          href={`/blog/${relatedPost.slug}`}
                          className="block group hover:bg-gray-100 p-2 rounded transition-colors"
                        >
                          <h4 className="text-sm font-medium text-gray-900 group-hover:text-pink-600 mb-1 line-clamp-2">
                            {relatedPost.title}
                          </h4>
                          <p className="text-xs text-gray-600 line-clamp-2">
                            {relatedPost.excerpt}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </div>

          {/* Enhanced Article Navigation */}
          <div className="mt-16 pt-8 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <Link
                href="/blog"
                className="flex items-center gap-3 px-6 py-3 bg-white border border-gray-200 rounded-xl hover:border-pink-200 hover:shadow-lg transition-all duration-200 group"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600 group-hover:text-pink-600 transition-colors" />
                <span className="font-medium text-gray-700 group-hover:text-pink-600 transition-colors">
                  Voltar ao blog
                </span>
              </Link>

              <div className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                <LikeButton
                  articleId={post.slug}
                  initialLikes={Math.floor(Math.random() * 100)}
                />
                <ShareButton
                  url={`/blog/${post.slug}`}
                  title={post.title}
                  description={post.excerpt}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <LandingFooter />
      </div>
    </>
  );
}
