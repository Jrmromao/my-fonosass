import { LegalPage, MailLink, Section } from '@/components/legal/LegalPage';
import { COMPANY } from '@/lib/legal/company';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Encarregado de Dados (DPO)',
  description:
    'Canal de contato para assuntos de privacidade e proteção de dados do Almanaque da Fala.',
  alternates: { canonical: '/dpo' },
};

export default function DPOPage() {
  return (
    <LegalPage
      title="Encarregado de Dados (DPO)"
      current="/dpo"
      intro={
        <p>
          O encarregado é o canal entre você, o {COMPANY.brandName} e a
          Autoridade Nacional de Proteção de Dados (ANPD) para tudo o que
          envolve seus dados pessoais (art. 41 da LGPD).
        </p>
      }
    >
      <Section id="contato" title="Contato">
        <dl className="grid gap-x-6 gap-y-2 rounded-md border border-neutral-200 p-4 text-sm sm:grid-cols-[10rem_1fr] dark:border-neutral-800">
          {COMPANY.dpoName && (
            <>
              <dt className="font-semibold text-neutral-900 dark:text-white">
                Encarregado
              </dt>
              <dd>{COMPANY.dpoName}</dd>
            </>
          )}
          <dt className="font-semibold text-neutral-900 dark:text-white">
            Email
          </dt>
          <dd>
            <MailLink email={COMPANY.privacyEmail} />
          </dd>
          <dt className="font-semibold text-neutral-900 dark:text-white">
            Prazo de resposta
          </dt>
          <dd>{COMPANY.privacyResponseTime}</dd>
        </dl>
      </Section>

      <Section id="quando" title="Quando escrever">
        <ul>
          <li>Para exercer um direito que não está disponível na sua conta.</li>
          <li>Para tirar dúvidas sobre como tratamos seus dados.</li>
          <li>Para pedir a remoção do seu email da lista de espera.</li>
          <li>Para avisar sobre um possível problema de segurança.</li>
        </ul>
        <p>
          Muitos pedidos você resolve sozinho, na hora, em{' '}
          <strong>Perfil → Privacidade</strong>: baixar seus dados, excluir a
          conta e mudar suas preferências. Veja{' '}
          <Link href="/lgpd">Seus direitos (LGPD)</Link>.
        </p>
      </Section>

      <Section id="o-que-faz" title="O que o encarregado faz">
        <ul>
          <li>Recebe e responde pedidos e reclamações sobre dados pessoais.</li>
          <li>Recebe comunicações da ANPD e toma as providências.</li>
          <li>
            Orienta quem trabalha no serviço sobre as práticas de proteção de
            dados.
          </li>
        </ul>
      </Section>
    </LegalPage>
  );
}
