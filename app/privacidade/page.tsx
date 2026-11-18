import {
  ControllerInfo,
  LegalPage,
  MailLink,
  Section,
} from '@/components/legal/LegalPage';
import { COMPANY } from '@/lib/legal/company';
import type { Metadata } from 'next';
import Link from 'next/link';

// Describes only what the code does today. When data handling changes
// (new provider, new data, new purpose), update this page and
// LEGAL_LAST_UPDATED in lib/legal/company.ts.

export const metadata: Metadata = {
  title: 'Política de Privacidade',
  description:
    'Quais dados o Almanaque da Fala coleta, por que, com quem compartilha e como você exerce seus direitos pela LGPD.',
  alternates: { canonical: '/privacidade' },
};

const PROVIDERS: { name: string; purpose: string; where: string }[] = [
  {
    name: 'Clerk',
    purpose: 'Login e conta (nome, email, senha, login com Google).',
    where: 'Estados Unidos',
  },
  {
    name: 'Cloudflare Turnstile (via Clerk)',
    purpose:
      'Verificação contra robôs ao criar conta (endereço IP e dados do navegador).',
    where: 'Estados Unidos e rede global',
  },
  {
    name: 'Stripe',
    purpose:
      'Pagamento da assinatura. Os dados do cartão vão direto para o Stripe; não passam pelos nossos servidores.',
    where: 'Estados Unidos',
  },
  {
    name: 'Supabase',
    purpose: 'Banco de dados (conta, assinatura, downloads, consentimentos).',
    where: 'Irlanda (União Europeia)',
  },
  {
    name: 'Vercel',
    purpose:
      'Hospedagem do site e medições de desempenho e de visitas agregadas, sem cookies.',
    where: 'Irlanda e rede global',
  },
  {
    name: 'Amazon Web Services (S3)',
    purpose:
      'Armazenamento dos arquivos das atividades e das inscrições na lista de espera.',
    where: 'Estados Unidos',
  },
  {
    name: 'Resend',
    purpose:
      'Envio dos emails do serviço (boas-vindas, confirmação e cancelamento da assinatura).',
    where: 'Estados Unidos',
  },
  {
    name: 'Sentry',
    purpose:
      'Relatórios de erros do site e do navegador (mensagem do erro, trecho do código e tipo de navegador), com emails, CPF e telefones removidos antes do envio.',
    where: 'Estados Unidos',
  },
  {
    name: 'Google',
    purpose:
      'Login com Google (se você escolher) e Google Analytics (somente se você aceitar).',
    where: 'Estados Unidos',
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Política de Privacidade"
      current="/privacidade"
      intro={
        <p>
          Esta política explica quais dados pessoais o {COMPANY.brandName}{' '}
          trata, para quê, com quem eles são compartilhados e como você exerce
          seus direitos, conforme a Lei Geral de Proteção de Dados (Lei nº
          13.709/2018, LGPD).
        </p>
      }
    >
      <Section id="controlador" title="1. Quem é o responsável">
        <p>
          O {COMPANY.brandName} é uma biblioteca de atividades de fonoaudiologia
          para imprimir, voltada a fonoaudiólogos. O responsável pelo tratamento
          dos seus dados (controlador) é:
        </p>
        <ControllerInfo />
      </Section>

      <Section id="dados" title="2. Quais dados tratamos">
        <ul>
          <li>
            <strong>Conta:</strong> nome, sobrenome e email. A senha é guardada
            pelo Clerk, nosso provedor de login; nós não temos acesso a ela. Se
            você entrar com o Google, recebemos o nome e o email da sua conta
            Google.
          </li>
          <li>
            <strong>Assinatura:</strong> plano, situação (ativa, pendente,
            cancelada) e datas do período pago. Não recebemos nem guardamos os
            dados do seu cartão.
          </li>
          <li>
            <strong>Uso da biblioteca:</strong> quais atividades você baixou e
            quando.
          </li>
          <li>
            <strong>Suas escolhas de privacidade:</strong> os consentimentos que
            você deu ou retirou, com data, endereço IP e navegador, para
            comprovar a escolha.
          </li>
          <li>
            <strong>Lista de espera:</strong> se você se inscrever na página de
            recursos gratuitos, seu email e o endereço IP da inscrição.
          </li>
          <li>
            <strong>Dados técnicos:</strong> endereço IP e dados do navegador
            usados para segurança (por exemplo, limitar tentativas abusivas) e
            nos registros técnicos da hospedagem.
          </li>
          <li>
            <strong>Relatórios de erros:</strong> quando o site falha, enviamos
            ao Sentry a mensagem do erro, o trecho do código que falhou e o tipo
            de navegador, sem cookies, corpo de requisições nem identificação da
            conta. O Sentry pode receber o endereço IP da conexão.
          </li>
        </ul>
        <p>
          <strong>Não tratamos dados de pacientes.</strong> O serviço não tem
          prontuários nem cadastro de pacientes, e as atividades não contêm
          dados de crianças. Não envie dados de pacientes por nenhum canal do
          serviço.
        </p>
      </Section>

      <Section
        id="finalidades"
        title="3. Para que usamos e com qual base legal"
      >
        <ul>
          <li>
            <strong>
              Criar e manter sua conta, liberar o acesso às atividades e cobrar
              a assinatura:
            </strong>{' '}
            execução do contrato com você (art. 7º, V, da LGPD).
          </li>
          <li>
            <strong>Enviar emails do serviço</strong> (boas-vindas, assinatura
            confirmada ou cancelada): execução do contrato (art. 7º, V).
          </li>
          <li>
            <strong>Guardar registros de pagamento:</strong> cumprimento de
            obrigação legal, como a fiscal (art. 7º, II).
          </li>
          <li>
            <strong>
              Segurança, prevenção de fraude e de abuso, e estatísticas de uso
              sem identificação
            </strong>{' '}
            (quantas vezes cada atividade foi baixada por mês): legítimo
            interesse (art. 7º, IX).
          </li>
          <li>
            <strong>
              Google Analytics, relatórios de erros do navegador, emails de
              novidades e lista de espera:
            </strong>{' '}
            somente com o seu consentimento (art. 7º, I), que você pode retirar
            a qualquer momento.
          </li>
          <li>
            <strong>Relatórios de erros dos nossos servidores</strong>, sem
            dados pessoais, para manter o site estável e seguro: legítimo
            interesse (art. 7º, IX).
          </li>
        </ul>
        <p>
          Não vendemos seus dados e não os usamos para publicidade de terceiros.
        </p>
      </Section>

      <Section id="compartilhamento" title="4. Com quem compartilhamos">
        <p>
          Usamos os fornecedores abaixo para operar o serviço. Eles tratam os
          dados em nosso nome e apenas para a finalidade indicada.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800">
                <th className="py-2 pr-4 font-semibold">Fornecedor</th>
                <th className="py-2 pr-4 font-semibold">Para quê</th>
                <th className="py-2 font-semibold">Onde</th>
              </tr>
            </thead>
            <tbody>
              {PROVIDERS.map((p) => (
                <tr
                  key={p.name}
                  className="border-b border-neutral-100 align-top dark:border-neutral-900"
                >
                  <td className="py-2 pr-4 font-medium">{p.name}</td>
                  <td className="py-2 pr-4">{p.purpose}</td>
                  <td className="py-2">{p.where}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Também podemos compartilhar dados quando a lei ou uma ordem judicial
          exigir.
        </p>
      </Section>

      <Section id="transferencia" title="5. Transferência internacional">
        <p>
          Como mostra a tabela acima, parte dos dados é tratada fora do Brasil,
          nos Estados Unidos e na União Europeia. Essas transferências são
          necessárias para executar o contrato com você (art. 33, IX, da LGPD)
          ou, no caso do Google Analytics e dos relatórios de erros do
          navegador, dependem do seu consentimento específico (art. 33, VIII).
          Os fornecedores tratam os dados segundo seus próprios compromissos
          contratuais de proteção de dados.
        </p>
      </Section>

      <Section id="retencao" title="6. Por quanto tempo guardamos">
        <ul>
          <li>
            Os dados da conta, da assinatura, dos downloads e dos consentimentos
            ficam guardados enquanto a sua conta existir.
          </li>
          <li>
            Quando você exclui a conta, esses dados são apagados e seu login é
            removido do Clerk. A assinatura ativa é cancelada na hora.
          </li>
          <li>
            Ficam apenas dados que não identificam você: a contagem mensal de
            downloads por atividade e o registro de que uma conta foi excluída
            (data e se tinha assinatura).
          </li>
          <li>
            Os registros de pagamento ficam com o Stripe pelo prazo exigido pela
            legislação fiscal.
          </li>
          <li>
            As inscrições na lista de espera ficam guardadas até você pedir a
            remoção pelo email abaixo.
          </li>
        </ul>
      </Section>

      <Section id="direitos" title="7. Seus direitos">
        <p>
          Você pode confirmar se tratamos seus dados, acessá-los, corrigi-los,
          levá-los para outro serviço, pedir a exclusão, retirar consentimentos
          e mais. Veja a lista completa e como pedir em{' '}
          <Link href="/lgpd">Seus direitos (LGPD)</Link>.
        </p>
        <p>
          Com a conta aberta, em <strong>Perfil → Privacidade</strong>, você
          mesmo baixa uma cópia dos seus dados, exclui a conta e muda suas
          preferências. Para o resto, escreva para{' '}
          <MailLink email={COMPANY.privacyEmail} />. Respondemos em{' '}
          {COMPANY.privacyResponseTime.toLowerCase()}.
        </p>
      </Section>

      <Section id="cookies" title="8. Cookies">
        <p>
          Usamos apenas os cookies necessários para o login funcionar. O Google
          Analytics e os relatórios de erros do navegador (Sentry) só são
          carregados se você aceitar. Detalhes em{' '}
          <Link href="/cookies">Política de Cookies</Link>.
        </p>
      </Section>

      <Section id="seguranca" title="9. Segurança">
        <p>
          Todo o tráfego usa conexão criptografada (HTTPS). O acesso aos dados é
          restrito a quem precisa deles para operar o serviço. Senhas ficam com
          o provedor de login e dados de cartão com o Stripe, nunca conosco. Se
          ocorrer um incidente de segurança que possa causar risco ou dano
          relevante, avisaremos você e a ANPD, como exige a LGPD.
        </p>
      </Section>

      <Section id="publico" title="10. Público do serviço">
        <p>
          O serviço é destinado a profissionais e estudantes de fonoaudiologia
          maiores de 18 anos. Não é feito para crianças, e não coletamos dados
          de crianças.
        </p>
      </Section>

      <Section id="alteracoes" title="11. Alterações desta política">
        <p>
          Quando esta política mudar, atualizaremos a data no topo da página. Se
          a mudança for relevante para você, avisaremos também por email.
        </p>
      </Section>

      <Section id="contato" title="12. Contato e ANPD">
        <p>
          Dúvidas e pedidos sobre privacidade:{' '}
          <MailLink email={COMPANY.privacyEmail} />. Você também pode reclamar à
          Autoridade Nacional de Proteção de Dados (ANPD), em{' '}
          <a
            href="https://www.gov.br/anpd"
            target="_blank"
            rel="noopener noreferrer"
          >
            gov.br/anpd
          </a>
          .
        </p>
      </Section>
    </LegalPage>
  );
}
