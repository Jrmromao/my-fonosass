import { LegalPage, MailLink, Section } from '@/components/legal/LegalPage';
import { COMPANY } from '@/lib/legal/company';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Seus direitos (LGPD)',
  description:
    'Os direitos que a LGPD garante sobre seus dados no Almanaque da Fala e como exercê-los.',
  alternates: { canonical: '/lgpd' },
};

// LGPD art. 18. "Na sua conta" points to what the product does by itself
// (components/settings/PrivacyPanel.tsx); everything else goes by email.
const RIGHTS: { right: string; how: string }[] = [
  {
    right: 'Confirmar se tratamos seus dados e acessá-los',
    how: 'Na sua conta: Perfil → Privacidade → baixar meus dados.',
  },
  {
    right: 'Corrigir dados incompletos, errados ou desatualizados',
    how: 'Por email. Você confere seus dados atuais em Perfil.',
  },
  {
    right: 'Portabilidade (levar seus dados para outro serviço)',
    how: 'Na sua conta: a cópia dos dados vem em JSON, um formato aberto.',
  },
  {
    right: 'Excluir seus dados',
    how: 'Na sua conta: Perfil → Privacidade → excluir conta. A exclusão é imediata.',
  },
  {
    right: 'Retirar um consentimento',
    how: 'Na sua conta: Perfil → Privacidade. Para o Google Analytics e os relatórios de erros, também na Política de Cookies.',
  },
  {
    right: 'Saber com quem compartilhamos seus dados',
    how: 'Na Política de Privacidade, item 4.',
  },
  {
    right: 'Saber o que acontece se você não consentir',
    how: 'Sem consentimento, apenas o Google Analytics, os relatórios de erros do navegador e os emails de novidades ficam desligados. O resto do serviço funciona normalmente.',
  },
  {
    right:
      'Pedir anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desacordo com a LGPD',
    how: 'Por email.',
  },
  {
    right: 'Opor-se a um tratamento feito com base no legítimo interesse',
    how: 'Por email.',
  },
  {
    right: 'Pedir revisão de decisões automatizadas',
    how: 'Não tomamos decisões automatizadas sobre você. Se tiver dúvidas, escreva.',
  },
];

export default function LGPDPage() {
  return (
    <LegalPage
      title="Seus direitos (LGPD)"
      current="/lgpd"
      intro={
        <p>
          A Lei Geral de Proteção de Dados (Lei nº 13.709/2018) garante a você
          controle sobre os seus dados pessoais. Esta página mostra cada direito
          e o caminho mais rápido para exercê-lo no {COMPANY.brandName}.
        </p>
      }
    >
      <Section id="direitos" title="Seus direitos e como exercê-los">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800">
                <th className="py-2 pr-4 font-semibold">Direito</th>
                <th className="py-2 font-semibold">Como</th>
              </tr>
            </thead>
            <tbody>
              {RIGHTS.map((r) => (
                <tr
                  key={r.right}
                  className="border-b border-neutral-100 align-top dark:border-neutral-900"
                >
                  <td className="py-2 pr-4 font-medium">{r.right}</td>
                  <td className="py-2">{r.how}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="pedido" title="Como fazer um pedido por email">
        <ul>
          <li>
            Escreva para <MailLink email={COMPANY.privacyEmail} /> a partir do
            email da sua conta, dizendo qual direito quer exercer.
          </li>
          <li>
            Se escrever de outro email, podemos pedir uma confirmação de que a
            conta é sua antes de atender, para proteger seus dados.
          </li>
          <li>
            O pedido é gratuito. Respondemos em{' '}
            {COMPANY.privacyResponseTime.toLowerCase()} a partir do recebimento.
          </li>
        </ul>
      </Section>

      <Section id="exclusao" title="O que acontece quando você exclui a conta">
        <ul>
          <li>Sua assinatura, se houver, é cancelada na hora.</li>
          <li>
            Apagamos seus dados de conta, assinatura, downloads e
            consentimentos, e removemos seu login.
          </li>
          <li>
            Ficam só dados que não identificam você: contagens mensais de
            downloads por atividade e o registro de que uma conta foi excluída.
          </li>
          <li>
            Os registros de pagamento ficam com o Stripe pelo prazo da
            legislação fiscal.
          </li>
          <li>
            Inscrições na lista de espera não são ligadas à conta. Para
            removê-las, peça por email.
          </li>
        </ul>
      </Section>

      <Section id="anpd" title="Se não ficar satisfeito">
        <p>
          Você pode reclamar à Autoridade Nacional de Proteção de Dados (ANPD),
          em{' '}
          <a
            href="https://www.gov.br/anpd"
            target="_blank"
            rel="noopener noreferrer"
          >
            gov.br/anpd
          </a>
          . Veja também a{' '}
          <Link href="/privacidade">Política de Privacidade</Link> e a página do{' '}
          <Link href="/dpo">Encarregado (DPO)</Link>.
        </p>
      </Section>
    </LegalPage>
  );
}
