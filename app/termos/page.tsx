import {
  ControllerInfo,
  LegalPage,
  MailLink,
  Section,
} from '@/components/legal/LegalPage';
import { FREE_SAMPLE_COUNT } from '@/lib/access-constants';
import { COMPANY } from '@/lib/legal/company';
import { PRO_PLAN, formatBRL } from '@/lib/pricing';
import type { Metadata } from 'next';
import Link from 'next/link';

// Prices and the free allowance come from the same constants the product
// uses (lib/pricing.ts, lib/access-constants.ts), so the terms never drift
// from what is charged.

export const metadata: Metadata = {
  title: 'Termos de Uso',
  description:
    'Regras de uso do Almanaque da Fala: conta, plano, cancelamento, direito de arrependimento e uso das atividades.',
  alternates: { canonical: '/termos' },
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Termos de Uso"
      current="/termos"
      intro={
        <p>
          Estes termos são o acordo entre você e o {COMPANY.brandName}. Ao criar
          uma conta ou assinar, você concorda com eles. Leia também a{' '}
          <Link href="/privacidade">Política de Privacidade</Link>.
        </p>
      }
    >
      <Section id="servico" title="1. O serviço">
        <p>
          O {COMPANY.brandName} é uma biblioteca on-line de atividades de
          fonoaudiologia para baixar e imprimir, organizadas por fonema e por
          tema. Ele é oferecido por:
        </p>
        <ControllerInfo />
      </Section>

      <Section id="conta" title="2. Sua conta">
        <ul>
          <li>
            O serviço é para profissionais e estudantes de fonoaudiologia
            maiores de 18 anos.
          </li>
          <li>
            Use dados verdadeiros e mantenha sua senha em segredo. A conta é
            pessoal: não compartilhe o acesso com outras pessoas.
          </li>
          <li>
            Você é responsável pelo que for feito com a sua conta. Se suspeitar
            de uso indevido, troque a senha e avise-nos.
          </li>
        </ul>
      </Section>

      <Section id="gratis" title="3. O que é grátis">
        <p>
          Com uma conta gratuita, você baixa todo mês as {FREE_SAMPLE_COUNT}{' '}
          atividades marcadas como &ldquo;Grátis&rdquo;. As demais atividades
          exigem assinatura. Podemos mudar quais atividades são grátis a cada
          mês.
        </p>
      </Section>

      <Section id="assinatura" title="4. Assinatura e pagamento">
        <ul>
          <li>
            Plano {PRO_PLAN.name}: {formatBRL(PRO_PLAN.monthlyPrice)} por mês ou{' '}
            {formatBRL(PRO_PLAN.yearlyPrice)} por ano. Dá acesso a todas as
            atividades da biblioteca enquanto a assinatura estiver ativa.
          </li>
          <li>
            O pagamento é feito pelo Stripe. A assinatura renova automaticamente
            no fim de cada período, com cobrança no mesmo meio de pagamento, até
            você cancelar.
          </li>
          <li>
            Se um pagamento falhar, o acesso às atividades pagas pode ser
            suspenso até a regularização.
          </li>
          <li>
            Se o preço mudar, avisaremos por email antes. O novo valor só vale a
            partir da renovação seguinte ao aviso, e você pode cancelar antes
            dela.
          </li>
        </ul>
      </Section>

      <Section id="cancelamento" title="5. Cancelamento e arrependimento">
        <ul>
          <li>
            Você cancela quando quiser, sem multa, em{' '}
            <strong>Perfil → Assinatura</strong>. O acesso continua até o fim do
            período já pago, e não há nova cobrança.
          </li>
          <li>
            <strong>Direito de arrependimento:</strong> em até 7 dias da
            contratação, você pode desistir e receber de volta o valor pago
            (art. 49 do Código de Defesa do Consumidor). Peça por{' '}
            <MailLink email={COMPANY.contactEmail} />.
          </li>
          <li>
            Excluir a conta cancela a assinatura na hora e encerra o acesso,
            inclusive ao período restante. Se quiser usar o período já pago,
            cancele a assinatura em vez de excluir a conta.
          </li>
        </ul>
      </Section>

      <Section id="licenca" title="6. Uso das atividades">
        <p>
          As atividades, imagens e textos são protegidos por direitos autorais
          (Lei nº 9.610/1998) e pertencem ao {COMPANY.brandName}. Ao baixar uma
          atividade, você recebe uma licença pessoal e intransferível para:
        </p>
        <ul>
          <li>imprimir e usar a atividade nos seus atendimentos;</li>
          <li>
            entregar cópias impressas a pacientes e familiares, para prática em
            casa.
          </li>
        </ul>
        <p>Não é permitido:</p>
        <ul>
          <li>
            revender, distribuir ou compartilhar os arquivos digitais, inclusive
            em grupos, redes sociais ou sites;
          </li>
          <li>
            remover ou esconder a marca d&rsquo;água ou o aviso de direitos
            autorais;
          </li>
          <li>
            usar as atividades para criar produtos concorrentes ou para treinar
            sistemas de inteligência artificial.
          </li>
        </ul>
        <p>
          A licença das atividades baixadas durante a assinatura continua
          valendo para uso nos seus atendimentos depois do cancelamento.
        </p>
      </Section>

      <Section id="responsabilidade" title="7. Uso profissional">
        <p>
          As atividades são material de apoio. A escolha, a adaptação e o uso
          com cada paciente dependem da avaliação e do julgamento do
          profissional responsável pelo atendimento. Não garantimos resultados
          terapêuticos.
        </p>
      </Section>

      <Section id="disponibilidade" title="8. Disponibilidade">
        <p>
          Trabalhamos para manter o serviço no ar, mas ele pode ficar
          indisponível em manutenções ou falhas de fornecedores. Podemos
          incluir, atualizar ou retirar atividades da biblioteca.
        </p>
      </Section>

      <Section id="suspensao" title="9. Suspensão">
        <p>
          Se você descumprir estes termos, por exemplo distribuindo os arquivos,
          podemos suspender ou encerrar sua conta, depois de avisar por email
          sempre que possível.
        </p>
      </Section>

      <Section id="alteracoes" title="10. Alterações destes termos">
        <p>
          Quando estes termos mudarem, atualizaremos a data no topo da página e
          avisaremos por email sobre mudanças relevantes. Se não concordar, você
          pode cancelar a assinatura e excluir a conta.
        </p>
      </Section>

      <Section id="lei" title="11. Lei e foro">
        <p>
          Estes termos seguem as leis do Brasil. Eventuais disputas serão
          resolvidas no foro do seu domicílio.
        </p>
      </Section>

      <Section id="contato" title="12. Contato">
        <p>
          Dúvidas sobre estes termos, a assinatura ou pagamentos:{' '}
          <MailLink email={COMPANY.contactEmail} />. Assuntos de privacidade:{' '}
          <MailLink email={COMPANY.privacyEmail} />.
        </p>
      </Section>
    </LegalPage>
  );
}
