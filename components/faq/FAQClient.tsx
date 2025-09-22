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
    id: 'what-is-almanaque',
    question: 'O que é o Almanaque da Fala?',
    answer:
      'O Almanaque da Fala é uma plataforma SaaS completa desenvolvida especificamente para fonoaudiólogos brasileiros. Nossa solução oferece gestão de pacientes, agendamentos, prontuários digitais, exercícios terapêuticos e muito mais, tudo em conformidade com a LGPD e regulamentações do CFFa.',
    category: 'Sobre a Plataforma',
  },
  {
    id: 'who-is-for',
    question: 'Para quem é destinado o Almanaque da Fala?',
    answer:
      'O Almanaque da Fala é destinado a fonoaudiólogos, clínicas de fonoaudiologia, consultórios particulares e profissionais da área de terapia da fala que buscam digitalizar e otimizar seus processos de trabalho.',
    category: 'Sobre a Plataforma',
  },
  {
    id: 'main-features',
    question: 'Quais são as principais funcionalidades?',
    answer:
      'Nossa plataforma inclui: gestão completa de pacientes, agendamento de consultas, prontuários digitais LGPD-compliant, biblioteca de exercícios terapêuticos, relatórios personalizados, sistema de backup automático, integração com sistemas de pagamento e muito mais.',
    category: 'Sobre a Plataforma',
  },

  // Preços e Planos
  {
    id: 'pricing-plans',
    question: 'Quais são os planos disponíveis?',
    answer:
      'Oferecemos planos flexíveis para diferentes necessidades: Plano Básico para profissionais individuais, Plano Profissional para clínicas pequenas e Plano Empresarial para grandes clínicas. Todos os planos incluem suporte técnico e atualizações automáticas.',
    category: 'Preços e Planos',
  },
  {
    id: 'free-trial',
    question: 'Há período de teste gratuito?',
    answer:
      'Sim! Oferecemos 14 dias de teste gratuito para todos os novos usuários, sem necessidade de cartão de crédito. Você pode explorar todas as funcionalidades antes de decidir pelo plano ideal.',
    category: 'Preços e Planos',
  },
  {
    id: 'payment-methods',
    question: 'Quais formas de pagamento são aceitas?',
    answer:
      'Aceitamos cartões de crédito (Visa, Mastercard, Elo), PIX, boleto bancário e transferência bancária. Também oferecemos desconto para pagamentos anuais.',
    category: 'Preços e Planos',
  },
  {
    id: 'cancel-subscription',
    question: 'Posso cancelar minha assinatura a qualquer momento?',
    answer:
      'Sim, você pode cancelar sua assinatura a qualquer momento através do painel de controle. Não há taxas de cancelamento e você continuará tendo acesso até o final do período pago.',
    category: 'Preços e Planos',
  },

  // Segurança e LGPD
  {
    id: 'lgpd-compliance',
    question: 'A plataforma é compatível com a LGPD?',
    answer:
      'Sim, o Almanaque da Fala foi desenvolvido com total conformidade à LGPD. Implementamos criptografia de dados, controle de acesso, auditoria de logs, backup seguro e todas as medidas necessárias para proteger as informações dos pacientes.',
    category: 'Segurança e LGPD',
  },
  {
    id: 'data-security',
    question: 'Como meus dados são protegidos?',
    answer:
      'Utilizamos criptografia de ponta a ponta, servidores seguros no Brasil, backup automático diário, monitoramento 24/7 e seguimos as melhores práticas de segurança da informação. Seus dados nunca são compartilhados com terceiros.',
    category: 'Segurança e LGPD',
  },
  {
    id: 'cffa-compliance',
    question: 'A plataforma atende às exigências do CFFa?',
    answer:
      'Sim, o Almanaque da Fala foi desenvolvido seguindo todas as diretrizes do Conselho Federal de Fonoaudiologia, incluindo formato de prontuários, tempo de retenção de dados e procedimentos de segurança.',
    category: 'Segurança e LGPD',
  },

  // Funcionalidades Técnicas
  {
    id: 'device-compatibility',
    question: 'Em quais dispositivos posso usar a plataforma?',
    answer:
      'O Almanaque da Fala funciona em qualquer dispositivo com navegador web: computadores, tablets e smartphones. Não é necessário instalar software adicional - tudo funciona na nuvem.',
    category: 'Funcionalidades Técnicas',
  },
  {
    id: 'internet-requirement',
    question: 'Preciso de internet para usar a plataforma?',
    answer:
      'Sim, a plataforma é baseada na nuvem e requer conexão com a internet. No entanto, algumas funcionalidades podem ser usadas offline e sincronizadas quando a conexão for restabelecida.',
    category: 'Funcionalidades Técnicas',
  },
  {
    id: 'data-backup',
    question: 'Como funciona o backup dos dados?',
    answer:
      'Realizamos backup automático diário de todos os dados em servidores seguros. Além disso, você pode exportar seus dados a qualquer momento em formatos padrão (PDF, Excel, CSV).',
    category: 'Funcionalidades Técnicas',
  },
  {
    id: 'integration-options',
    question: 'A plataforma se integra com outros sistemas?',
    answer:
      'Sim, oferecemos integração com sistemas de pagamento, calendários (Google Calendar, Outlook), sistemas de gestão financeira e outras ferramentas comuns usadas em clínicas.',
    category: 'Funcionalidades Técnicas',
  },

  // Suporte e Treinamento
  {
    id: 'support-available',
    question: 'Que tipo de suporte está disponível?',
    answer:
      'Oferecemos suporte técnico por email, chat online e telefone durante horário comercial. Também disponibilizamos vídeo-aulas, documentação completa e webinars de treinamento.',
    category: 'Suporte e Treinamento',
  },
  {
    id: 'training-included',
    question: 'Há treinamento incluído?',
    answer:
      'Sim! Incluímos treinamento completo para você e sua equipe: vídeo-aulas, documentação detalhada, sessões de treinamento online e suporte durante o período de adaptação.',
    category: 'Suporte e Treinamento',
  },
  {
    id: 'response-time',
    question: 'Qual o tempo de resposta do suporte?',
    answer:
      'Nosso compromisso é responder em até 4 horas durante horário comercial (segunda a sexta, 8h às 18h). Para questões urgentes, oferecemos suporte prioritário.',
    category: 'Suporte e Treinamento',
  },

  // Migração e Implementação
  {
    id: 'data-migration',
    question: 'Posso migrar dados de outros sistemas?',
    answer:
      'Sim, nossa equipe de suporte pode ajudar na migração de dados de planilhas, sistemas antigos ou outras plataformas. Oferecemos este serviço sem custo adicional para planos anuais.',
    category: 'Migração e Implementação',
  },
  {
    id: 'implementation-time',
    question: 'Quanto tempo leva para implementar a plataforma?',
    answer:
      'A implementação básica pode ser feita em 1-2 dias úteis. Para migrações complexas ou personalizações específicas, o prazo pode variar de 1-2 semanas.',
    category: 'Migração e Implementação',
  },
  {
    id: 'customization',
    question: 'A plataforma pode ser personalizada?',
    answer:
      'Sim, oferecemos opções de personalização para atender necessidades específicas do seu consultório ou clínica, incluindo campos customizados, relatórios personalizados e integrações específicas.',
    category: 'Migração e Implementação',
  },
];

const categories = [
  'Sobre a Plataforma',
  'Preços e Planos',
  'Segurança e LGPD',
  'Funcionalidades Técnicas',
  'Suporte e Treinamento',
  'Migração e Implementação',
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12">
      <FAQStructuredData
        faqs={faqData.map((item) => ({
          question: item.question,
          answer: item.answer,
        }))}
      />
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Perguntas Frequentes
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Encontre respostas para as principais dúvidas sobre o FonoSaaS. Se
            não encontrar o que procura, entre em contato conosco!
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setSelectedCategory('all')}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                selectedCategory === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              )}
            >
              Todas as Categorias
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                  selectedCategory === category
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                )}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredFAQs.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              <button
                onClick={() => toggleItem(item.id)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-gray-900 pr-4">
                  {item.question}
                </span>
                {openItems.includes(item.id) ? (
                  <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                )}
              </button>

              {openItems.includes(item.id) && (
                <div className="px-6 pb-4">
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-gray-700 leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 text-center bg-indigo-50 rounded-lg p-8">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">
            Ainda tem dúvidas?
          </h3>
          <p className="text-gray-600 mb-6">
            Nossa equipe de suporte está pronta para ajudar você!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/dashboard"
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Começar Teste Grátis
            </a>
            <a
              href="mailto:suporte@almanaquedafala.com.br"
              className="inline-flex items-center px-6 py-3 bg-white text-indigo-600 font-medium rounded-lg border border-indigo-200 hover:bg-indigo-50 transition-colors"
            >
              Entrar em Contato
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
