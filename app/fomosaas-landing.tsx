'use client';

import { motion } from 'framer-motion';
import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  Download,
  Mic,
  Play,
  Star,
  Volume2,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import BalloonOptimizedMinimal from '@/components/Balloon/BalloonOptimizedMinimal';
import { SubscriptionPlans } from '@/components/SubscriptionPlans';
import WaitingListAlert from '@/components/WaitingListAlert';
import LandingFooter from '@/components/layout/LandingFooter';
import SharedNavbar from '@/components/layout/SharedNavbar';
import { BlogPost } from '@/lib/blog';
import { useAuth } from '@clerk/nextjs';
import { format } from 'date-fns';
import { ptBR } from '@clerk/localizations';

interface FomosaasLandingProps {
  featuredBlogPosts: BlogPost[];
}

export default function FomosaasLanding({
  featuredBlogPosts,
}: FomosaasLandingProps) {
  const [scrolled, setScrolled] = useState(false);
  const [showWaitingList, setShowWaitingList] = useState(true);
  const { isSignedIn } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {showWaitingList && (
        <WaitingListAlert onClose={() => setShowWaitingList(false)} />
      )}
      <SharedNavbar scrolled={scrolled} showWaitingList={showWaitingList} />

      {/* Hero */}
      <section
        className={`relative ${showWaitingList ? 'pt-48 pb-24 md:pt-56 md:pb-32' : 'pt-32 pb-24 md:pt-40 md:pb-32'}`}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/80 to-white pointer-events-none" />
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-pink-200/30 rounded-full blur-3xl" />
        <div className="absolute top-40 right-1/4 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl" />

        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold rounded-full bg-indigo-100 text-indigo-700 tracking-wide">
                Fonoaudiologia Infantil
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 text-indigo-950 leading-tight font-display">
                Sua crianca vai treinar a fala{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-500">
                  brincando
                </span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                Atividades terapeuticas criadas por fonoaudiologa para praticar
                fonemas em casa. Cada exercicio e uma brincadeira com resultado
                real.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/sign-up"
                  className="px-8 py-3.5 rounded-full bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-all flex items-center gap-2 w-full sm:w-auto justify-center shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30"
                >
                  Comece Agora <ArrowRight size={18} />
                </Link>
                <Link
                  href="#como-funciona"
                  className="px-8 py-3.5 rounded-full bg-white text-indigo-700 border border-indigo-200 hover:border-indigo-300 transition-all w-full sm:w-auto text-center font-semibold hover:shadow-sm"
                >
                  Como Funciona
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Interactive Demo */}
        <motion.div
          className="mt-20 relative max-w-5xl mx-auto px-4"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-indigo-900/10 border border-indigo-100 bg-white">
            <BalloonOptimizedMinimal />
          </div>
        </motion.div>
      </section>

      {/* Social Proof Bar */}
      <section className="py-8 border-y border-gray-100 bg-gray-50/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 text-center">
            <div>
              <p className="text-2xl font-bold text-indigo-900">30+</p>
              <p className="text-sm text-gray-500">Atividades disponiveis</p>
            </div>
            <div className="w-px h-10 bg-gray-200 hidden md:block" />
            <div>
              <p className="text-2xl font-bold text-indigo-900">3</p>
              <p className="text-sm text-gray-500">Fonemas cobertos</p>
            </div>
            <div className="w-px h-10 bg-gray-200 hidden md:block" />
            <div>
              <p className="text-2xl font-bold text-indigo-900">CFFa</p>
              <p className="text-sm text-gray-500">Metodologia validada</p>
            </div>
            <div className="w-px h-10 bg-gray-200 hidden md:block" />
            <div>
              <p className="text-2xl font-bold text-indigo-900">100%</p>
              <p className="text-sm text-gray-500">Criado por fonoaudiologa</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="como-funciona" className="py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <span className="inline-block px-4 py-1.5 mb-4 text-sm font-semibold rounded-full bg-pink-100 text-pink-700">
              Simples e eficaz
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-indigo-950 font-display">
              Tres passos para comecar
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                viewport={{ once: true }}
                className="relative text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center mx-auto mb-5 text-white font-bold text-xl shadow-lg shadow-indigo-500/20">
                  {index + 1}
                </div>
                <h3 className="text-lg font-bold mb-2 text-indigo-950">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Exercise Types */}
      <section className="py-24 bg-gradient-to-b from-indigo-50/50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <span className="inline-block px-4 py-1.5 mb-4 text-sm font-semibold rounded-full bg-indigo-100 text-indigo-700">
              Biblioteca de Atividades
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-indigo-950 font-display">
              Exercicios que criancas adoram
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Cada atividade trabalha um fonema especifico de forma ludica e
              envolvente.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {exerciseTypes.map((type, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-pink-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  {type.icon}
                </div>
                <h3 className="font-bold text-indigo-950 mb-1">{type.title}</h3>
                <p className="text-sm text-gray-500">{type.age}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust / Credibility */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <span className="inline-block px-4 py-1.5 mb-4 text-sm font-semibold rounded-full bg-pink-100 text-pink-700">
                  Credibilidade
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-indigo-950 mb-6 font-display">
                  Feito por quem entende de fala
                </h2>
                <div className="space-y-4">
                  {trustPoints.map((point, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-2 h-2 rounded-full bg-indigo-600" />
                      </div>
                      <p className="text-gray-700 leading-relaxed">{point}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-indigo-50 to-pink-50 rounded-2xl p-8 border border-indigo-100"
              >
                <div className="flex items-center gap-4 mb-6">
                  <Image
                    src="/logo.png"
                    alt="Almanaque da Fala"
                    width={56}
                    height={56}
                    className="rounded-full"
                  />
                  <div>
                    <p className="font-bold text-indigo-950">
                      Eliane Lourenco da Mota
                    </p>
                    <p className="text-sm text-gray-500">
                      Fonoaudiologa Clinica
                    </p>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed italic">
                  "Cada exercicio e desenvolvido com base em praticas clinicas
                  reais e validado antes de ser publicado. O objetivo e que a
                  crianca pratique o fonema sem perceber que esta fazendo
                  terapia."
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      {featuredBlogPosts.length > 0 && (
        <section className="py-24 bg-gradient-to-b from-indigo-50/50 to-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center mb-16">
              <span className="inline-block px-4 py-1.5 mb-4 text-sm font-semibold rounded-full bg-indigo-100 text-indigo-700">
                Blog
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-indigo-950 font-display">
                Conhecimento especializado
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {featuredBlogPosts.map((post: any, index: number) => (
                <motion.article
                  key={post.slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden group"
                >
                  <div className="p-6">
                    <time className="text-xs text-gray-400 font-medium">
                      {format(new Date(post.date), "dd 'de' MMMM", {
                        locale: ptBR as any,
                      })}
                    </time>
                    <h3 className="text-lg font-bold text-indigo-950 mt-2 mb-3 group-hover:text-indigo-600 transition-colors line-clamp-2">
                      <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                      {post.excerpt}
                    </p>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm inline-flex items-center gap-1"
                    >
                      Ler artigo <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Pricing */}
      <section id="assinatura" className="py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <span className="inline-block px-4 py-1.5 mb-4 text-sm font-semibold rounded-full bg-pink-100 text-pink-700">
              Planos
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-indigo-950 font-display">
              Acesso completo para profissionais
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Todas as ferramentas para sua pratica profissional.
            </p>
          </div>
          <SubscriptionPlans />
        </div>
      </section>

      {/* FAQ */}
      <section
        id="faq"
        className="py-24 bg-gradient-to-b from-indigo-50/50 to-white"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <span className="inline-block px-4 py-1.5 mb-4 text-sm font-semibold rounded-full bg-indigo-100 text-indigo-700">
              FAQ
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-indigo-950 font-display">
              Duvidas frequentes
            </h2>
          </div>

          <div className="max-w-2xl mx-auto divide-y divide-gray-100">
            {faqs.map((faq, index) => (
              <FaqItem
                key={index}
                question={faq.question}
                answer={faq.answer}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-3xl p-12 md:p-16 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl" />

            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-display">
                Comece hoje mesmo
              </h2>
              <p className="text-indigo-200 text-lg mb-8 max-w-xl mx-auto">
                Cadastre-se e tenha acesso a atividades terapeuticas prontas
                para imprimir e usar com seus pacientes.
              </p>
              <Link
                href="/sign-up"
                className="inline-flex items-center px-8 py-3.5 rounded-full bg-white text-indigo-700 font-semibold hover:shadow-lg transition-all gap-2"
              >
                Criar conta gratuita <ArrowRight size={18} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="py-5">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full text-left"
      >
        <h3 className="text-base font-semibold text-indigo-950 pr-4">
          {question}
        </h3>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 text-gray-600 leading-relaxed"
        >
          {answer}
        </motion.p>
      )}
    </div>
  );
}

// Data
const steps = [
  {
    title: 'Escolha o fonema',
    description:
      'Clique no balao do fonema que a crianca precisa treinar. Cada balao tem atividades especificas.',
  },
  {
    title: 'Baixe a atividade',
    description:
      'Faca o download do PDF com jogos ilustrados — caca-palavras, trilhas, colorir — tudo pronto para imprimir.',
  },
  {
    title: 'Brinque e treine',
    description:
      'A crianca pratica o fonema sem perceber que esta fazendo terapia. Diversao com resultado.',
  },
];

const exerciseTypes = [
  {
    title: 'Encontre e Circule',
    age: '4-5 anos',
    icon: <Mic size={20} className="text-indigo-600" />,
  },
  {
    title: 'Caca-Palavras',
    age: '6-8 anos',
    icon: <BookOpen size={20} className="text-indigo-600" />,
  },
  {
    title: 'Jogo de Tabuleiro',
    age: '8-10 anos',
    icon: <Play size={20} className="text-indigo-600" />,
  },
  {
    title: 'Colorir e Falar',
    age: '10-12 anos',
    icon: <Star size={20} className="text-indigo-600" />,
  },
];

const trustPoints = [
  'Desenvolvido por fonoaudiologa com experiencia clinica em atendimento infantil.',
  'Exercicios seguem as diretrizes do Conselho Federal de Fonoaudiologia (CFFa).',
  'Cada atividade e revisada e aprovada antes de ser publicada na plataforma.',
  'Conteudo adaptado para o contexto linguistico do portugues brasileiro.',
];

const faqs = [
  {
    question: 'O que e o Almanaque da Fala?',
    answer:
      'E uma plataforma de exercicios de fonoaudiologia para criancas brasileiras. Oferecemos atividades terapeuticas prontas para imprimir que ajudam no desenvolvimento da fala e linguagem.',
  },
  {
    question: 'A partir de qual idade posso usar?',
    answer:
      'Temos atividades para criancas a partir de 4 anos, organizadas por faixa etaria e nivel de dificuldade.',
  },
  {
    question: 'Substitui a terapia com fonoaudiologo?',
    answer:
      'Nao. O Almanaque da Fala e uma ferramenta complementar ao tratamento fonoaudiologico. Recomendamos sempre o acompanhamento de um profissional.',
  },
  {
    question: 'Posso cancelar a qualquer momento?',
    answer:
      'Sim. Sem multas ou taxas. O acesso permanece ativo ate o final do periodo pago.',
  },
  {
    question: 'Como funciona o download das atividades?',
    answer:
      'Apos escolher o fonema e a atividade, voce faz o download de um PDF pronto para imprimir. Cada PDF tem a marca Almanaque da Fala e instrucoes claras.',
  },
];
