import { FREE_SAMPLE_COUNT } from '@/lib/access-constants';
import { PRO_PLAN, YEARLY_DISCOUNT, formatBRL } from '@/lib/pricing';

// FAQ content: shown on /faq (components/faq/FAQClient.tsx) and published as
// FAQPage structured data for search engines (app/faq/page.tsx). One source,
// so what Google shows always matches the page. Client-safe.

export interface FaqEntry {
  question: string;
  answer: string;
}

export const FAQ_CATEGORIES = ['Geral', 'Planos', 'Conteúdo'] as const;

export const FAQ_DATA: Record<(typeof FAQ_CATEGORIES)[number], FaqEntry[]> = {
  Geral: [
    {
      question: 'O que é o Almanaque da Fala?',
      answer:
        'Uma plataforma de materiais terapêuticos para fonoaudiólogos. Atividades imprimíveis organizadas por fonema, criadas e revisadas por profissional.',
    },
    {
      question: 'Para quem é a plataforma?',
      answer:
        'Para fonoaudiólogos que atendem crianças e precisam de materiais prontos para usar em sessões.',
    },
    {
      question: 'Substitui a terapia presencial?',
      answer:
        'Não. O Almanaque da Fala é uma ferramenta complementar. Os materiais são usados pelo profissional durante as sessões.',
    },
  ],
  Planos: [
    {
      question: 'Quanto custa?',
      answer: `Com a conta gratuita você baixa todo mês as ${FREE_SAMPLE_COUNT} atividades com o selo “Grátis”. O plano ${PRO_PLAN.name} libera a biblioteca inteira, com downloads ilimitados, por ${formatBRL(PRO_PLAN.monthlyPrice)}/mês ou ${formatBRL(PRO_PLAN.yearlyPrice)}/ano (${YEARLY_DISCOUNT.percent}% de desconto no plano anual).`,
    },
    {
      question: 'Posso cancelar a qualquer momento?',
      answer:
        'Sim. Sem multas ou taxas. O acesso permanece ativo até o fim do período pago.',
    },
    {
      question: 'Existe período de teste?',
      answer: `Não há período de teste. Com a conta gratuita você explora a biblioteca e baixa todo mês as ${FREE_SAMPLE_COUNT} atividades com o selo “Grátis”, sem prazo para acabar.`,
    },
    {
      question: 'Como funciona o pagamento?',
      answer:
        'Aceitamos cartão de crédito via Stripe. A cobrança é recorrente (mensal ou anual) e pode ser cancelada a qualquer momento.',
    },
  ],
  Conteúdo: [
    {
      question: 'Quem cria os materiais?',
      answer:
        'Todos os exercícios são desenvolvidos e revisados por fonoaudióloga com experiência clínica em atendimento infantil.',
    },
    {
      question: 'Com que frequência novos materiais são adicionados?',
      answer: 'Todo mês. As atividades novas entram no plano sem custo extra.',
    },
    {
      question: 'Quantos fonemas estão disponíveis?',
      answer:
        'Atualmente 16 fonemas cobertos, cada um com 4 tipos de atividade (encontre e circule, caça-palavras, jogo de tabuleiro, colorir e falar).',
    },
    {
      question: 'Posso imprimir os materiais?',
      answer:
        'Sim. Todos os materiais vêm em formato pronto para impressão com a marca Almanaque da Fala.',
    },
  ],
};

/** schema.org FAQPage for every entry, in page order. */
export function faqJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_CATEGORIES.flatMap((category) =>
      FAQ_DATA[category].map((entry) => ({
        '@type': 'Question',
        name: entry.question,
        acceptedAnswer: { '@type': 'Answer', text: entry.answer },
      }))
    ),
  };
}
