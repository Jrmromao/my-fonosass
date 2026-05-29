'use client';

import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import FAQStructuredData from './FAQStructuredData';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  // Sobre a Plataforma
  {
    id: 'what-is-fonosass',
    question: 'O que é o Almanaque da Fala?',
    answer:
      'O Almanaque da Fala é uma plataforma especializada em exercícios de fala para fonoaudiólogos brasileiros. Oferecemos uma biblioteca completa de exercícios terapêuticos organizados por fonemas, com materiais prontos para impressão e uso em consultas.',
    category: 'Sobre a Plataforma',
  },
  {
    id: 'who-is-for',
    question: 'Para quem é destinado o Almanaque da Fala?',
    answer:
      'O Almanaque da Fala é destinado a fonoaudiólogos, terapeutas da fala e profissionais que trabalham com reabilitação de fala e linguagem, especialmente aqueles que atendem crianças com dificuldades de articulação.',
    category: 'Sobre a Plataforma',
  },
  {
    id: 'main-features',
    question: 'Quais são as principais funcionalidades?',
    answer:
      'Nossa plataforma oferece: biblioteca com 50+ exercícios de fala organizados por fonemas (/p/, /k/, /t/, /r/, /f/, /s/, /v/, /l/, /m/, /n/), filtros por dificuldade e faixa etária, visualização gratuita dos exercícios, download em PDF para assinantes, e interface responsiva para uso em qualquer dispositivo.',
    category: 'Sobre a Plataforma',
  },

  // Exercícios e Fonemas
  {
    id: 'exercise-types',
    question: 'Que tipos de exercícios estão disponíveis?',
    answer:
      'Oferecemos exercícios variados incluindo: jogos de articulação, atividades de consciência fonológica, exercícios de respiração, atividades lúdicas para diferentes fonemas, materiais visuais para apoio terapêutico e exercícios progressivos por nível de dificuldade.',
    category: 'Exercícios e Fonemas',
  },
  {
    id: 'phoneme-coverage',
    question: 'Quais fonemas estão cobertos?',
    answer:
      'Cobrimos os principais fonemas problemáticos: /p/, /k/, /t/, /r/, /f/, /s/, /v/, /l/, /m/, /n/. Cada fonema possui exercícios específicos para diferentes posições na palavra (inicial, medial, final) e níveis de dificuldade.',
    category: 'Exercícios e Fonemas',
  },
  {
    id: 'age-groups',
    question: 'Para quais faixas etárias são os exercícios?',
    answer:
      'Nossos exercícios são desenvolvidos para crianças de 3 a 12 anos, com adaptações específicas para cada faixa etária. Incluímos atividades mais lúdicas para crianças menores e exercícios mais complexos para crianças maiores.',
    category: 'Exercícios e Fonemas',
  },
  {
    id: 'exercise-preview',
    question: 'Posso ver os exercícios antes de assinar?',
    answer:
      'Sim! Todos os usuários podem visualizar gratuitamente o conteúdo dos exercícios. Apenas o download em PDF requer assinatura. Isso permite que você conheça a qualidade dos materiais antes de se comprometer.',
    category: 'Exercícios e Fonemas',
  },

  // Preços e Planos
  {
    id: 'pricing-plans',
    question: 'Qual é o valor da assinatura profissional?',
    answer:
      'Oferecemos o plano Profissional por R$ 39,90/mês que inclui: acesso a todos os exercícios de fonemas, biblioteca completa de recursos, material para imprimir, materiais de referência estendidos e suporte por email prioritário. Também oferecemos desconto de 16% para pagamento anual.',
    category: 'Preços e Planos',
  },
  {
    id: 'free-trial',
    question: 'Há período de teste gratuito?',
    answer:
      'Sim! Oferecemos teste gratuito para que você possa experimentar a plataforma antes de se comprometer. Durante o período de teste, você terá acesso a uma seleção de exercícios para conhecer a qualidade dos materiais.',
    category: 'Preços e Planos',
  },
  {
    id: 'waiting-list',
    question: 'Como posso me cadastrar na lista de espera?',
    answer:
      'O Almanaque da Fala está em construção! Você pode se cadastrar na nossa lista de espera através do site para ser o primeiro a saber quando lançarmos. Basta clicar em "Cadastrar" na página inicial.',
    category: 'Preços e Planos',
  },
  {
    id: 'cancel-subscription',
    question: 'Posso cancelar minha assinatura a qualquer momento?',
    answer:
      'Sim, você pode cancelar sua assinatura a qualquer momento. Não há taxas ocultas ou de cancelamento, e você continuará tendo acesso até o final do período pago.',
    category: 'Preços e Planos',
  },

  // Uso e Funcionalidades
  {
    id: 'device-compatibility',
    question: 'Em quais dispositivos posso usar a plataforma?',
    answer:
      'O Almanaque da Fala funciona em qualquer dispositivo com navegador web: computadores, tablets e smartphones. A interface é totalmente responsiva e otimizada para uso em diferentes tamanhos de tela.',
    category: 'Uso e Funcionalidades',
  },
  {
    id: 'how-it-works',
    question: 'Como funciona o processo de uso da plataforma?',
    answer:
      'O processo é simples: 1) Cadastre-se gratuitamente e preencha um questionário sobre as necessidades da criança, 2) Receba um plano personalizado de exercícios, 3) Comece a praticar com os exercícios interativos e acompanhe o progresso de forma divertida.',
    category: 'Uso e Funcionalidades',
  },
  {
    id: 'personalized-plan',
    question: 'Como é criado o plano personalizado?',
    answer:
      'Nosso sistema analisa as informações fornecidas no questionário inicial e cria um plano de exercícios personalizado baseado nas necessidades específicas da criança, incluindo os fonemas que precisam ser trabalhados e o nível de dificuldade apropriado.',
    category: 'Uso e Funcionalidades',
  },
  {
    id: 'progress-tracking',
    question: 'Posso acompanhar o progresso da criança?',
    answer:
      'Sim! A plataforma oferece ferramentas para acompanhar o desenvolvimento da fala da criança ao longo do tempo, permitindo que você veja as melhorias e ajuste os exercícios conforme necessário.',
    category: 'Uso e Funcionalidades',
  },

  // Suporte e Atualizações
  {
    id: 'therapist-replacement',
    question: 'O Almanaque da Fala substitui a terapia com um fonoaudiólogo?',
    answer:
      'Não, o Almanaque da Fala é uma ferramenta complementar que pode ser usada junto com a terapia tradicional. Recomendamos sempre o acompanhamento de um fonoaudiólogo profissional para casos que requerem avaliação e tratamento especializado.',
    category: 'Suporte e Atualizações',
  },
  {
    id: 'age-appropriate',
    question: 'A partir de qual idade posso usar o Almanaque da Fala?',
    answer:
      'Nossos exercícios são desenvolvidos para crianças a partir de 3 anos de idade, quando já começam a desenvolver habilidades de fala mais complexas. Cada exercício é claramente marcado com a faixa etária recomendada.',
    category: 'Suporte e Atualizações',
  },
  {
    id: 'suitable-for-child',
    question: 'Como sei se o Almanaque da Fala é adequado para meu filho?',
    answer:
      'O questionário inicial que você preenche ao se cadastrar nos ajuda a identificar se a plataforma é adequada para as necessidades específicas do seu filho. Além disso, oferecemos teste gratuito para que você possa experimentar antes de se comprometer.',
    category: 'Suporte e Atualizações',
  },
  {
    id: 'support-available',
    question: 'Que tipo de suporte está disponível?',
    answer:
      'Oferecemos suporte por email para dúvidas técnicas e pedagógicas. Para fonoaudiólogos profissionais, oferecemos suporte prioritário e recursos especializados. Também disponibilizamos artigos especializados e dicas práticas no nosso blog.',
    category: 'Suporte e Atualizações',
  },
];

const categories = [
  'Sobre a Plataforma',
  'Exercícios e Fonemas',
  'Preços e Planos',
  'Uso e Funcionalidades',
  'Suporte e Atualizações',
];

export default function FAQClient() {
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const toggleItem = (id: string) => {
    setOpenItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredFAQs =
    selectedCategory === 'all'
      ? faqData
      : faqData.filter((item) => item.category === selectedCategory);

  return (
    <div className="py-16">
      <FAQStructuredData
        faqs={faqData.map((item) => ({
          question: item.question,
          answer: item.answer,
        }))}
      />
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Enhanced Header */}
        <header className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-100 text-indigo-600 text-sm font-medium mb-6">
            <span
              className="w-2 h-2 bg-indigo-600 rounded-full mr-2"
              aria-hidden="true"
            ></span>
            Suporte & Ajuda
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 mb-6 leading-relaxed">
            Perguntas Frequentes
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Encontre respostas para as principais dúvidas sobre o{' '}
            <strong>Almanaque da Fala</strong> e descubra como nossos exercícios
            interativos podem ajudar no desenvolvimento da fala do seu filho
          </p>
        </header>

        {/* Statistics Section */}
        <div className="mb-16">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div className="text-4xl font-bold text-indigo-600 mb-2">50+</div>
              <div className="text-gray-600 font-medium">
                Exercícios Interativos
              </div>
            </div>
            <div className="text-center bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div className="text-4xl font-bold text-purple-600 mb-2">10</div>
              <div className="text-gray-600 font-medium">
                Categorias Temáticas
              </div>
            </div>
            <div className="text-center bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div className="text-4xl font-bold text-green-600 mb-2">3-9</div>
              <div className="text-gray-600 font-medium">Anos de Idade</div>
            </div>
          </div>
        </div>

        {/* Enhanced Category Filter */}
        <div className="mb-12">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              Filtrar por Categoria
            </h3>
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => setSelectedCategory('all')}
                className={cn(
                  'px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 shadow-sm',
                  selectedCategory === 'all'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg transform scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:shadow-md hover:scale-105'
                )}
              >
                Todas as Categorias
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={cn(
                    'px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 shadow-sm',
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg transform scale-105'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:shadow-md hover:scale-105'
                  )}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Enhanced FAQ Items */}
        <div className="space-y-6">
          {filteredFAQs.map((item, index) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              <button
                onClick={() => toggleItem(item.id)}
                className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200 group"
              >
                <div className="flex items-start space-x-4 flex-1">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center text-sm font-bold text-indigo-600">
                    {index + 1}
                  </div>
                  <span className="font-semibold text-gray-900 text-lg pr-4 group-hover:text-indigo-600 transition-colors">
                    {item.question}
                  </span>
                </div>
                <div className="flex-shrink-0">
                  {openItems.includes(item.id) ? (
                    <ChevronUp className="h-6 w-6 text-indigo-600 transition-transform duration-200" />
                  ) : (
                    <ChevronDown className="h-6 w-6 text-gray-400 group-hover:text-indigo-600 transition-all duration-200" />
                  )}
                </div>
              </button>

              {openItems.includes(item.id) && (
                <div className="px-8 pb-6">
                  <div className="pt-4 border-t border-gray-100">
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6">
                      <p className="text-gray-700 leading-relaxed text-base">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Enhanced Contact CTA */}
        <div className="mt-16">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-12 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 text-white text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-white rounded-full mr-2"></span>
                Suporte Especializado
              </div>
              <h3 className="text-4xl font-bold mb-6">Ainda tem dúvidas?</h3>
              <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto leading-relaxed">
                Nossa equipe de especialistas está pronta para ajudar você a
                começar a jornada de desenvolvimento da fala do seu filho com o{' '}
                <strong>Almanaque da Fala</strong>
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <a
                  href="/dashboard"
                  className="inline-flex items-center px-8 py-4 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-indigo-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <span className="mr-2"></span>
                  Experimente Grátis
                </a>
                <a
                  href="mailto:contato@almanaquedafala.com.br"
                  className="inline-flex items-center px-8 py-4 bg-white/20 text-white font-semibold rounded-xl border border-white/30 hover:bg-white/30 transition-all duration-200 backdrop-blur-sm"
                >
                  <span className="mr-2"></span>
                  Fale com um Especialista
                </a>
              </div>
              <div className="mt-8 text-indigo-200 text-sm">
                <p>
                  Resposta em até 24 horas • Suporte em português •
                  Especialistas certificados
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
