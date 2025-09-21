'use client';

import LandingFooter from '@/components/layout/LandingFooter';
import { BlogPost } from '@/lib/blog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowRight, BookOpen, Calendar, Clock, Tag, User } from 'lucide-react';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
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
      <Head>
        <title>Blog - Dicas e Recursos para Fonoaudiólogos | FonoSaaS</title>
        <meta
          name="description"
          content="Artigos especializados, dicas práticas e recursos para fonoaudiólogos brasileiros. Aprenda sobre gestão de consultório, exercícios terapêuticos e mais."
        />
        <meta
          name="keywords"
          content="fonoaudiologia, dicas fonoaudiólogo, exercícios fonoaudiológicos, gestão consultório"
        />
        <meta
          property="og:title"
          content="Blog - Dicas e Recursos para Fonoaudiólogos"
        />
        <meta
          property="og:description"
          content="Artigos especializados, dicas práticas e recursos para fonoaudiólogos brasileiros."
        />
        <meta property="og:type" content="website" />
      </Head>
      <div className="min-h-screen bg-white">
        {/* Modern Header */}
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center space-x-3 group">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-yellow-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <BookOpen className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900 group-hover:text-pink-600 transition-colors">
                  FonoSaaS Blog
                </span>
              </Link>

              <nav className="hidden md:flex items-center space-x-8">
                <Link
                  href="/"
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  Início
                </Link>
                <Link href="/blog" className="text-gray-900 font-medium">
                  Blog
                </Link>
                <Link
                  href="/dashboard"
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  Dashboard
                </Link>
              </nav>

              <Link
                href="/dashboard"
                className="px-4 py-2 bg-gradient-to-r from-pink-500 to-yellow-400 text-white rounded-full text-sm font-medium hover:shadow-lg hover:shadow-pink-500/25 transition-all"
              >
                Acessar Dashboard
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-pink-50 to-yellow-50 py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Conhecimento que transforma vidas
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Artigos especializados, dicas práticas e recursos para
                fonoaudiólogos brasileiros. Aprenda com especialistas e
                transforme sua prática clínica.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {allTags.slice(0, 6).map((tag) => (
                  <button
                    key={tag}
                    onClick={() =>
                      setSelectedTag(selectedTag === tag ? null : tag)
                    }
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedTag === tag
                        ? 'bg-pink-500 text-white shadow-lg'
                        : 'bg-white text-gray-600 hover:bg-pink-50 hover:text-pink-600'
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
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Featured Article */}
          {filteredArticles.find((article) => article.featured) && (
            <section className="mb-16">
              <div className="flex items-center gap-2 mb-8">
                <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                <span className="text-sm font-semibold text-pink-600 uppercase tracking-wide">
                  Destaque
                </span>
              </div>
              {(() => {
                const featured = filteredArticles.find(
                  (article) => article.featured
                );
                return featured ? (
                  <article className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group">
                    <div className="p-8 md:p-12">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-yellow-400 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="font-semibold text-gray-900">
                            {featured.author}
                          </span>
                          <span>•</span>
                          <time className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {format(
                              new Date(featured.date),
                              "dd 'de' MMMM 'de' yyyy",
                              { locale: ptBR }
                            )}
                          </time>
                        </div>
                      </div>
                      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight group-hover:text-pink-600 transition-colors">
                        <Link href={`/blog/${featured.slug}`}>
                          {featured.title}
                        </Link>
                      </h2>
                      <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                        {featured.excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {featured.readingTime} min de leitura
                          </span>
                          <div className="flex items-center gap-2">
                            {featured.tags &&
                              featured.tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-medium"
                                >
                                  {tag}
                                </span>
                              ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <ShareButton
                            url={`/blog/${featured.slug}`}
                            title={featured.title}
                            description={featured.excerpt}
                          />
                          <Link
                            href={`/blog/${featured.slug}`}
                            className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 font-semibold group-hover:gap-3 transition-all"
                          >
                            Ler artigo <ArrowRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                ) : null;
              })()}
            </section>
          )}

          {/* Articles List */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  {selectedTag
                    ? `Artigos sobre ${selectedTag}`
                    : 'Todos os artigos'}
                </h2>
              </div>
              {selectedTag && (
                <button
                  onClick={() => setSelectedTag(null)}
                  className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                >
                  <Tag className="w-4 h-4" />
                  Limpar filtro
                </button>
              )}
            </div>

            <div className="grid gap-8">
              {filteredArticles
                .filter((article) => !article.featured)
                .map((article, index) => (
                  <article key={article.slug} className="group">
                    <div className="flex items-start gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-yellow-400 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span className="font-semibold text-gray-900">
                              {article.author}
                            </span>
                            <span>•</span>
                            <time className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(article.date), "dd 'de' MMMM", {
                                locale: ptBR,
                              })}
                            </time>
                          </div>
                        </div>

                        <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-pink-600 transition-colors leading-tight">
                          <Link href={`/blog/${article.slug}`}>
                            {article.title}
                          </Link>
                        </h3>

                        <p className="text-gray-600 mb-4 leading-relaxed line-clamp-2">
                          {article.excerpt}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {article.readingTime} min
                            </span>
                            <div className="flex items-center gap-2">
                              {article.tags &&
                                article.tags.slice(0, 2).map((tag) => (
                                  <button
                                    key={tag}
                                    onClick={() => setSelectedTag(tag)}
                                    className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium hover:bg-pink-100 hover:text-pink-600 transition-colors"
                                  >
                                    {tag}
                                  </button>
                                ))}
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
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
                              className="text-pink-600 hover:text-pink-700 font-medium text-sm"
                            >
                              Ler mais
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>

                    {index <
                      filteredArticles.filter((article) => !article.featured)
                        .length -
                        1 && (
                      <div className="mt-8 border-b border-gray-100"></div>
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
          <section className="mt-20">
            <div className="bg-gradient-to-br from-pink-50 to-yellow-50 rounded-3xl p-8 md:p-12 text-center">
              <div className="max-w-2xl mx-auto">
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Fique por dentro das novidades
                </h3>
                <p className="text-lg text-gray-600 mb-8">
                  Receba artigos exclusivos, dicas práticas e recursos para
                  fonoaudiólogos diretamente na sua caixa de entrada. Sem spam,
                  apenas conteúdo de qualidade.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                  <input
                    type="email"
                    placeholder="Digite seu email"
                    className="flex-1 px-6 py-4 border border-gray-200 rounded-full focus:ring-2 focus:ring-pink-500 focus:border-transparent text-center sm:text-left placeholder-gray-400"
                  />
                  <button className="px-8 py-4 bg-gradient-to-r from-pink-500 to-yellow-400 text-white rounded-full font-semibold hover:shadow-lg hover:shadow-pink-500/25 transition-all">
                    Inscrever-se
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  Cancele a qualquer momento. Respeitamos sua privacidade.
                </p>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <LandingFooter />
      </div>
    </>
  );
}
