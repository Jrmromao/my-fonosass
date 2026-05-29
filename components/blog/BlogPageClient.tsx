'use client';

import LandingFooter from '@/components/layout/LandingFooter';
import { BlogPost } from '@/lib/blog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowRight, BookOpen, Calendar, Clock, Tag, User } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import SharedNavbar from '../layout/SharedNavbar';
import Breadcrumbs from '../seo/Breadcrumbs';
import ConversionCTA from './ConversionCTA';
import ExitIntentPopup from './ExitIntentPopup';
import LikeButton from './LikeButton';
import ShareButton from './ShareButton';

interface BlogPageClientProps {
  articles: BlogPost[];
}

export default function BlogPageClient({ articles }: BlogPageClientProps) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Get all unique tags
  const allTags = Array.from(
    new Set(articles.flatMap((article) => article.tags || []))
  );

  // Filter articles by selected tag
  const filteredArticles = selectedTag
    ? articles.filter((article) => article.tags?.includes(selectedTag))
    : articles;

  return (
    <>
      <div className="min-h-screen bg-white">
        {/* Shared Navbar */}
        <SharedNavbar />

        {/* Breadcrumbs */}
        <div className="bg-white border-b border-gray-100 pt-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <Breadcrumbs
              items={[
                { name: 'Home', href: '/' },
                { name: 'Blog', href: '/blog' },
              ]}
            />
          </div>
        </div>

        {/* Hero Section */}
        <section className="pt-16 pb-8 sm:pt-20 sm:pb-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 font-display">
                Blog
              </h1>
              <p className="text-lg text-gray-500">
                Artigos sobre fonoaudiologia, exercícios práticos e dicas para
                profissionais.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 mt-6">
              {allTags.slice(0, 6).map((tag) => (
                <button
                  key={tag}
                  onClick={() =>
                    setSelectedTag(selectedTag === tag ? null : tag)
                  }
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    selectedTag === tag
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Featured Article */}
          {filteredArticles.find((article) => article.featured) && (
            <section className="mb-12">
              {(() => {
                const featured = filteredArticles.find(
                  (article) => article.featured
                );
                return featured ? (
                  <article className="border border-gray-200 rounded-xl p-6 sm:p-8 hover:border-gray-300 transition-colors">
                    <div className="flex items-center gap-3 mb-4 text-sm text-gray-500">
                      <span className="font-medium text-gray-900">
                        {featured.author}
                      </span>
                      <span>·</span>
                      <time>
                        {format(
                          new Date(featured.date),
                          "dd 'de' MMMM 'de' yyyy",
                          { locale: ptBR }
                        )}
                      </time>
                      <span>·</span>
                      <span>{featured.readingTime} min</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 font-display">
                      <Link
                        href={`/blog/${featured.slug}`}
                        className="hover:text-indigo-700 transition-colors"
                      >
                        {featured.title}
                      </Link>
                    </h2>
                    <p className="text-gray-600 mb-4 max-w-3xl">
                      {featured.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        {featured.tags?.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <Link
                        href={`/blog/${featured.slug}`}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                      >
                        Ler artigo <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </article>
                ) : null;
              })()}
            </section>
          )}

          {/* Articles List */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                {selectedTag
                  ? `Artigos sobre ${selectedTag}`
                  : 'Todos os artigos'}
              </h2>
              {selectedTag && (
                <button
                  onClick={() => setSelectedTag(null)}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Limpar filtro
                </button>
              )}
            </div>

            <div className="divide-y divide-gray-100">
              {filteredArticles
                .filter((article) => !article.featured)
                .map((article) => (
                  <article key={article.slug} className="py-6 first:pt-0">
                    <div className="flex items-center gap-3 mb-2 text-sm text-gray-500">
                      <span className="font-medium text-gray-700">
                        {article.author}
                      </span>
                      <span>·</span>
                      <time>
                        {format(new Date(article.date), "dd 'de' MMMM", {
                          locale: ptBR,
                        })}
                      </time>
                      <span>·</span>
                      <span>{article.readingTime} min</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1.5 font-display">
                      <Link
                        href={`/blog/${article.slug}`}
                        className="hover:text-indigo-700 transition-colors"
                      >
                        {article.title}
                      </Link>
                    </h3>
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center gap-2">
                      {article.tags?.slice(0, 3).map((tag) => (
                        <button
                          key={tag}
                          onClick={() => setSelectedTag(tag)}
                          className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs hover:bg-gray-200 transition-colors"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </article>
                ))}
            </div>

            {filteredArticles.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400">
                  {selectedTag
                    ? `Não há artigos sobre "${selectedTag}" no momento.`
                    : 'Não há artigos publicados ainda.'}
                </p>
                {selectedTag && (
                  <button
                    onClick={() => setSelectedTag(null)}
                    className="text-indigo-600 hover:text-indigo-700 font-medium mt-2 text-sm"
                  >
                    Ver todos os artigos
                  </button>
                )}
              </div>
            )}
          </section>

          {/* Newsletter Signup */}
          <section className="mt-12 sm:mt-16 lg:mt-20">
            <div className="bg-slate-900 rounded-lg p-8 md:p-12 text-center">
              <div className="max-w-xl mx-auto">
                <h3 className="text-xl font-bold text-white mb-2">
                  Fique por dentro das novidades
                </h3>
                <p className="text-sm text-gray-400 mb-6">
                  Receba artigos e dicas para fonoaudiólogos. Sem spam.
                </p>
                <div className="flex gap-2 max-w-sm mx-auto">
                  <input
                    type="email"
                    placeholder="O seu email"
                    className="flex-1 px-4 py-2.5 border border-gray-700 bg-white/5 rounded-md text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#f97066]/50"
                  />
                  <button className="px-5 py-2.5 bg-[#f97066] hover:bg-[#e5645b] text-white rounded-md text-sm font-medium transition-colors">
                    Inscrever
                  </button>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <LandingFooter />

        {/* Exit Intent Popup */}
        <ExitIntentPopup />
      </div>
    </>
  );
}
