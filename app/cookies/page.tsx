import { AnalyticsChoiceControl } from '@/components/cookies/AnalyticsChoiceControl';
import { LegalPage, MailLink, Section } from '@/components/legal/LegalPage';
import { COMPANY } from '@/lib/legal/company';
import type { Metadata } from 'next';
import Link from 'next/link';

// Lists only what the site really stores in the browser. Keep in sync with
// lib/cookieConsent.ts, components/GoogleAnalytics.tsx, lib/auth/viewAs.ts
// and any new localStorage key.

export const metadata: Metadata = {
  title: 'Política de Cookies',
  description:
    'Quais cookies e dados de navegador o Almanaque da Fala usa e como mudar sua escolha sobre análise de uso e relatórios de erros.',
  alternates: { canonical: '/cookies' },
};

type Row = { name: string; who: string; purpose: string; duration: string };

const ESSENTIAL: Row[] = [
  {
    name: '__session, __client_uat, __client (e variações com sufixo)',
    who: 'Clerk (login)',
    purpose: 'Manter você conectado e proteger a sessão.',
    duration: 'Enquanto a sessão durar',
  },
  {
    name: 'Dados da verificação contra robôs',
    who: 'Cloudflare Turnstile (via Clerk)',
    purpose: 'Confirmar que quem cria a conta é uma pessoa.',
    duration: 'Durante a verificação',
  },
  {
    name: 'almanaque_ver_como',
    who: 'Almanaque da Fala',
    purpose:
      'Só para administradores: ver o site como um assinante ou um usuário sem assinatura.',
    duration: '8 horas',
  },
];

const ANALYTICS: Row[] = [
  {
    name: '_ga, _ga_<ID>',
    who: 'Google Analytics',
    purpose: 'Contar visitas e entender como o site é usado.',
    duration: 'Até 2 anos',
  },
];

const STORAGE: Row[] = [
  {
    name: 'almanaque:analytics-consent',
    who: 'Almanaque da Fala',
    purpose:
      'Lembrar se você aceitou ou recusou o Google Analytics e os relatórios de erros.',
    duration: 'Até você limpar os dados do navegador',
  },
  {
    name: 'almanaque:library-view',
    who: 'Almanaque da Fala',
    purpose: 'Lembrar se você prefere a biblioteca em grade ou em lista.',
    duration: 'Até você limpar os dados do navegador',
  },
  {
    name: 'exitIntentShown',
    who: 'Almanaque da Fala',
    purpose: 'Não repetir o aviso do blog na mesma visita.',
    duration: 'Até fechar a aba',
  },
];

function CookieTable({ rows }: { rows: Row[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[36rem] text-left text-sm">
        <thead>
          <tr className="border-b border-neutral-200 dark:border-neutral-800">
            <th className="py-2 pr-4 font-semibold">Nome</th>
            <th className="py-2 pr-4 font-semibold">De quem</th>
            <th className="py-2 pr-4 font-semibold">Para quê</th>
            <th className="py-2 font-semibold">Duração</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.name}
              className="border-b border-neutral-100 align-top dark:border-neutral-900"
            >
              <td className="py-2 pr-4 font-mono text-xs">{r.name}</td>
              <td className="py-2 pr-4">{r.who}</td>
              <td className="py-2 pr-4">{r.purpose}</td>
              <td className="py-2">{r.duration}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function CookiePolicyPage() {
  const analyticsEnabled =
    Boolean(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) ||
    Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN);

  return (
    <LegalPage
      title="Política de Cookies"
      current="/cookies"
      intro={
        <p>
          Cookies são pequenos arquivos que o site guarda no seu navegador. Aqui
          estão todos os que o {COMPANY.brandName} usa, e outros dados que
          guardamos no navegador, com o motivo de cada um.
        </p>
      }
    >
      <Section
        id="sua-escolha"
        title="Sua escolha sobre análise e relatórios de erros"
      >
        <p>
          Dois recursos dependem do seu consentimento: o Google Analytics e os
          relatórios de erros do navegador (Sentry). Eles só são carregados se
          você aceitar. Se você recusar ou mudar de ideia, eles são desligados e
          os cookies do Google Analytics são apagados.
        </p>
        <AnalyticsChoiceControl enabled={analyticsEnabled} />
        <p>
          A escolha vale para este navegador. Com a conta aberta, você também
          pode mudá-la em <strong>Perfil → Privacidade</strong>.
        </p>
      </Section>

      <Section id="essenciais" title="Cookies essenciais">
        <p>
          Necessários para o login e a segurança. Funcionam sem consentimento,
          porque o site não funciona sem eles.
        </p>
        <CookieTable rows={ESSENTIAL} />
      </Section>

      <Section id="analise" title="Cookies de análise (só com consentimento)">
        <CookieTable rows={ANALYTICS} />
      </Section>

      <Section id="erros" title="Relatórios de erros (só com consentimento)">
        <p>
          Se você aceitar, o navegador envia ao Sentry um aviso quando uma
          página quebra: a mensagem do erro, o trecho do código que falhou, o
          tipo de navegador e o endereço da página sem o que vem depois do
          &quot;?&quot;. Removemos emails, CPF e telefones antes do envio. O
          Sentry não grava cookies nem dados no seu navegador, mas, como em
          qualquer conexão, pode receber o seu endereço IP. Os dados ficam
          armazenados nos Estados Unidos. Nossos servidores também enviam avisos
          de erro ao Sentry, sem dados pessoais, para mantermos o site
          funcionando.
        </p>
      </Section>

      <Section id="navegador" title="Outros dados guardados no navegador">
        <p>
          Não são cookies e não saem do seu navegador. Guardam só preferências
          do site.
        </p>
        <CookieTable rows={STORAGE} />
      </Section>

      <Section id="sem-cookies" title="Medição sem cookies">
        <p>
          A Vercel, nossa hospedagem, mede o desempenho das páginas e conta
          visitas de forma agregada, sem cookies e sem identificar você.
        </p>
      </Section>

      <Section id="terceiros" title="Páginas de terceiros">
        <p>
          O pagamento acontece na página do Stripe e o login com Google na
          página do Google. Os cookies dessas páginas seguem as políticas desses
          serviços.
        </p>
      </Section>

      <Section id="navegador-config" title="Como apagar cookies">
        <p>
          Você pode apagar ou bloquear cookies nas configurações do navegador.
          Se bloquear os essenciais, não será possível entrar na conta.
        </p>
      </Section>

      <Section id="contato" title="Dúvidas">
        <p>
          Escreva para <MailLink email={COMPANY.privacyEmail} />. Veja também a{' '}
          <Link href="/privacidade">Política de Privacidade</Link>.
        </p>
      </Section>
    </LegalPage>
  );
}
