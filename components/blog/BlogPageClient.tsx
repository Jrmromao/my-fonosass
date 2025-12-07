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
        <section className="bg-gradient-to-br from-pink-50 to-yellow-50 pt-16 pb-12 sm:pt-20 sm:pb-16 lg:pt-24 lg:pb-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <div className="mb-6 sm:mb-8">
                <span className="inline-block px-3 py-1.5 mb-4 sm:mb-6 text-xs sm:text-sm font-medium rounded-full bg-pink-100 text-pink-600">
                  Blog
                </span>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 lg:mb-8 leading-tight">
                  Conhecimento que transforma vidas
                </h1>
                <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-6 sm:mb-8 lg:mb-10 leading-relaxed max-w-3xl mx-auto px-2">
                  Artigos especializados, dicas práticas e recursos para
                  fonoaudiólogos brasileiros. Aprenda com especialistas e
                  transforme sua prática clínica.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3 px-2">
                {allTags.slice(0, 6).map((tag) => (
                  <button
                    key={tag}
                    onClick={() =>
                      setSelectedTag(selectedTag === tag ? null : tag)
                    }
                    className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ${
                      selectedTag === tag
                        ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/25'
                        : 'bg-white text-gray-600 hover:bg-pink-50 hover:text-pink-600 hover:shadow-md'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Featured Article */}
          {filteredArticles.find((article) => article.featured) && (
            <section className="mb-12 sm:mb-16 lg:mb-20">
              <div className="flex items-center gap-3 mb-6 sm:mb-8 lg:mb-10">
                <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                <span className="text-xs sm:text-sm font-bold text-pink-600 uppercase tracking-wider">
                  • Destaque
                </span>
              </div>
              {(() => {
                const featured = filteredArticles.find(
                  (article) => article.featured
                );
                return featured ? (
                  <article className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 group border border-gray-100">
                    <div className="p-6 sm:p-8 md:p-10 lg:p-16">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-pink-500 to-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                          <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-sm text-gray-600">
                          <span className="font-bold text-gray-900 text-sm sm:text-base">
                            {featured.author}
                          </span>
                          <span className="hidden sm:inline text-gray-400">
                            •
                          </span>
                          <time className="flex items-center gap-2 text-gray-500 text-xs sm:text-sm">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                            {format(
                              new Date(featured.date),
                              "dd 'de' MMMM 'de' yyyy",
                              { locale: ptBR }
                            )}
                          </time>
                        </div>
                      </div>
                      <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight group-hover:text-pink-600 transition-colors">
                        <Link href={`/blog/${featured.slug}`}>
                          {featured.title}
                        </Link>
                      </h2>
                      <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 leading-relaxed max-w-4xl">
                        {featured.excerpt}
                      </p>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-sm text-gray-500">
                          <span className="flex items-center gap-2 text-sm sm:text-base">
                            <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                            {featured.readingTime} min de leitura
                          </span>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            {featured.tags &&
                              featured.tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className="px-3 py-1.5 sm:px-4 sm:py-2 bg-pink-100 text-pink-700 rounded-full text-xs sm:text-sm font-medium hover:bg-pink-200 transition-colors cursor-pointer"
                                  onClick={() => setSelectedTag(tag)}
                                >
                                  {tag}
                                </span>
                              ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 sm:gap-6">
                          <ShareButton
                            url={`/blog/${featured.slug}`}
                            title={featured.title}
                            description={featured.excerpt}
                          />
                          <Link
                            href={`/blog/${featured.slug}`}
                            className="inline-flex items-center gap-2 sm:gap-3 text-pink-600 hover:text-pink-700 font-bold text-sm sm:text-base lg:text-lg group-hover:gap-3 sm:group-hover:gap-4 transition-all"
                          >
                            Ler artigo{' '}
                            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Conversion CTA for featured article */}
                    <div className="px-6 sm:px-8 md:px-10 lg:px-16 pb-6 sm:pb-8 lg:pb-10">
                      <ConversionCTA variant="article" />
                    </div>
                  </article>
                ) : null;
              })()}
            </section>
          )}

          {/* Articles List */}
          <section>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 sm:mb-12">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <h2 className="text-base sm:text-lg font-bold text-gray-700 uppercase tracking-wider">
                  {selectedTag
                    ? `Artigos sobre ${selectedTag}`
                    : 'Todos os artigos'}
                </h2>
              </div>
              {selectedTag && (
                <button
                  onClick={() => setSelectedTag(null)}
                  className="text-xs sm:text-sm text-gray-500 hover:text-gray-700 flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 rounded-full hover:bg-gray-100 transition-all self-start sm:self-auto"
                >
                  <Tag className="w-3 h-3 sm:w-4 sm:h-4" />
                  Limpar filtro
                </button>
              )}
            </div>

            <div className="grid gap-8 sm:gap-12">
              {filteredArticles
                .filter((article) => !article.featured)
                .map((article, index) => (
                  <article key={article.slug} className="group">
                    <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 hover:shadow-lg transition-all duration-300 border border-gray-100">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-pink-500 to-yellow-400 rounded-full flex items-center justify-center shadow-md">
                          <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500">
                          <span className="font-bold text-gray-900 text-sm sm:text-base">
                            {article.author}
                          </span>
                          <span className="hidden sm:inline text-gray-400">
                            •
                          </span>
                          <time className="flex items-center gap-2 text-xs sm:text-sm">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                            {format(new Date(article.date), "dd 'de' MMMM", {
                              locale: ptBR,
                            })}
                          </time>
                        </div>
                      </div>

                      <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 group-hover:text-pink-600 transition-colors leading-tight">
                        <Link href={`/blog/${article.slug}`}>
                          {article.title}
                        </Link>
                      </h3>

                      <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-4 sm:mb-6 leading-relaxed line-clamp-3">
                        {article.excerpt}
                      </p>

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                          <span className="flex items-center gap-2 text-xs sm:text-sm">
                            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                            {article.readingTime} min
                          </span>
                          <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                            {article.tags &&
                              article.tags.slice(0, 2).map((tag) => (
                                <button
                                  key={tag}
                                  onClick={() => setSelectedTag(tag)}
                                  className="px-2 py-1 sm:px-3 sm:py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium hover:bg-pink-100 hover:text-pink-600 transition-colors"
                                >
                                  {tag}
                                </button>
                              ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 sm:gap-4">
                          <LikeButton
                            articleId={article.slug}
                            initialLikes={Math.floor(Math.random() * 50)} // Random likes for demo
                          />
                          <ShareButton
                            url={`/blog/${article.slug}`}
                            title={article.title}
                            description={article.excerpt}
                          />
                          <Link
                            href={`/blog/${article.slug}`}
                            className="text-pink-600 hover:text-pink-700 font-semibold text-xs sm:text-sm flex items-center gap-1 group-hover:gap-2 transition-all"
                          >
                            Ler mais{' '}
                            <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Conversion CTA after each article */}
                    <div className="mt-4 sm:mt-6">
                      <ConversionCTA variant="article" />
                    </div>

                    {index <
                      filteredArticles.filter((article) => !article.featured)
                        .length -
                        1 && (
                      <div className="mt-8 sm:mt-12 border-b border-gray-200"></div>
                    )}
                  </article>
                ))}
            </div>

            {filteredArticles.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhum artigo encontrado
                </h3>
                <p className="text-gray-600 mb-4">
                  {selectedTag
                    ? `Não há artigos sobre "${selectedTag}" no momento.`
                    : 'Não há artigos publicados ainda.'}
                </p>
                {selectedTag && (
                  <button
                    onClick={() => setSelectedTag(null)}
                    className="text-pink-600 hover:text-pink-700 font-medium"
                  >
                    Ver todos os artigos
                  </button>
                )}
              </div>
            )}
          </section>

          {/* Newsletter Signup */}
          <section className="mt-12 sm:mt-16 lg:mt-20">
            <div className="bg-gradient-to-br from-pink-50 to-yellow-50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 text-center">
              <div className="max-w-2xl mx-auto">
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
                  Fique por dentro das novidades
                </h3>
                <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 px-2">
                  Receba artigos exclusivos, dicas práticas e recursos para
                  fonoaudiólogos diretamente na sua caixa de entrada. Sem spam,
                  apenas conteúdo de qualidade.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-lg mx-auto">
                  <input
                    type="email"
                    placeholder="Digite seu email"
                    className="flex-1 px-4 py-3 sm:px-6 sm:py-4 border border-gray-200 rounded-full focus:ring-2 focus:ring-pink-500 focus:border-transparent text-center sm:text-left placeholder-gray-400 text-sm sm:text-base"
                  />
                  <button className="px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-pink-500 to-yellow-400 text-white rounded-full font-semibold hover:shadow-lg hover:shadow-pink-500/25 transition-all text-sm sm:text-base">
                    Inscrever-se
                  </button>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4">
                  Cancele a qualquer momento. Respeitamos sua privacidade.
                </p>
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
