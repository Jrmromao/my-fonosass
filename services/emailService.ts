import { Resend } from 'resend';
import 'server-only';
import {
  FREE_DEFAULT_PHONEME,
  FREE_SAMPLE_COUNT,
} from '@/lib/access-constants';
import { phonemeLabel } from '@/lib/activityLabels';
import { formatBRL } from '@/lib/pricing';
import { EMAIL_LOGO_BASE64, EMAIL_LOGO_CID } from './emailLogo';

const resend = new Resend(process.env.RESEND_API_KEY);
const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || 'https://www.almanaquedafala.com.br';

const WELCOME_FROM = 'Eliane Mota <noreply@almanaquedafala.com.br>';
// Optional: where replies to the welcome email should go (e.g. Eliane's inbox).
const REPLY_TO = process.env.EMAIL_REPLY_TO;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** "Olá, Ana!" from a full name; "Olá!" when there is no name. */
function greeting(userName: string) {
  const firstName = escapeHtml(userName.trim().split(/\s+/)[0] || '');
  return `<p>Olá${firstName ? `, ${firstName}` : ''}!</p>`;
}

const SIGNATURE = `<p style="margin-top: 24px;">Um abraço,<br><strong>Eliane Mota</strong><br><span style="color: #64748b; font-size: 12px;">Fonoaudióloga, Almanaque da Fala</span></p>`;

/** DD/MM/AAAA in Brasília time. */
function formatDateBR(date: Date) {
  return date.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
}

/** Send from Eliane with the shared logo; logs Resend errors, never throws. */
async function sendFromEliane(
  label: string,
  message: { to: string; subject: string; html: string }
) {
  try {
    const { error } = await resend.emails.send({
      from: WELCOME_FROM,
      ...(REPLY_TO ? { replyTo: REPLY_TO } : {}),
      attachments: LOGO_ATTACHMENTS,
      ...message,
    });
    // The Resend SDK returns failures in `error` instead of throwing.
    if (error) console.error(`${label} email failed:`, error);
  } catch (error) {
    console.error(`${label} email failed:`, error);
  }
}

export interface SubscriptionEmailPlan {
  /** Price in BRL, e.g. 39.9 */
  amount: number;
  interval: 'month' | 'year';
  /** Next renewal date. */
  renewsAt: Date;
}

// ─── Base Template ────────────────────────────────────────────
// Table-based layout with inline styles: Gmail and Outlook drop or mangle
// div-based layouts (max-width, backgrounds), which broke the card.

const FONT =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

/** Inline logo attachment; pass to every send that uses baseTemplate. */
const LOGO_ATTACHMENTS = [
  {
    filename: 'logo.png',
    content: EMAIL_LOGO_BASE64,
    contentId: EMAIL_LOGO_CID,
  },
];

function baseTemplate(content: string) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="width: 100%; max-width: 560px; background-color: #ffffff; border-radius: 4px;">
          <tr>
            <td align="center" style="padding: 28px 40px 24px 40px;">
              <img src="cid:${EMAIL_LOGO_CID}" alt="Almanaque da Fala" width="141" height="112" style="display: block; border: 0; outline: none; text-decoration: none; width: 141px; height: 112px;" />
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px;"><div style="border-top: 1px solid #e2e8f0; font-size: 0; line-height: 0;">&nbsp;</div></td>
          </tr>
          <tr>
            <td style="padding: 32px 40px; font-family: ${FONT}; font-size: 14px; line-height: 1.7; color: #334155;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px;"><div style="border-top: 1px solid #e2e8f0; font-size: 0; line-height: 0;">&nbsp;</div></td>
          </tr>
          <tr>
            <td align="center" style="padding: 24px 40px; font-family: ${FONT};">
              <p style="color: #94a3b8; font-size: 11px; margin: 0 0 8px 0;">
                <a href="${APP_URL}/privacidade" style="color: #94a3b8; text-decoration: none;">Privacidade</a>
                &nbsp;&middot;&nbsp;
                <a href="${APP_URL}/faq" style="color: #94a3b8; text-decoration: none;">FAQ</a>
                &nbsp;&middot;&nbsp;
                <a href="${APP_URL}/contato" style="color: #94a3b8; text-decoration: none;">Contato</a>
              </p>
              <p style="color: #cbd5e1; font-size: 11px; margin: 0;">
                &copy; ${new Date().getFullYear()} Almanaque da Fala. Todos os direitos reservados.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function button(href: string, text: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 28px auto;">
    <tr>
      <td align="center" bgcolor="#1e293b" style="border-radius: 6px;">
        <a href="${href}" style="display: inline-block; padding: 12px 28px; font-family: ${FONT}; font-size: 14px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 6px;">${text}</a>
      </td>
    </tr>
  </table>`;
}

function infoBox(content: string) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;">
    <tr>
      <td bgcolor="#f8fafc" style="background-color: #f8fafc; border-radius: 6px; padding: 16px 20px; font-family: ${FONT}; font-size: 13px; line-height: 1.7; color: #334155;">${content}</td>
    </tr>
  </table>`;
}

function warningBox(content: string) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;">
    <tr>
      <td bgcolor="#fef2f2" style="background-color: #fef2f2; border-left: 3px solid #f97066; border-radius: 4px; padding: 16px 20px; font-family: ${FONT}; font-size: 13px; line-height: 1.6; color: #991b1b;">${content}</td>
    </tr>
  </table>`;
}

// ─── Email Methods ────────────────────────────────────────────

export class EmailService {
  static async sendWelcomeEmail(userEmail: string, userName: string) {
    try {
      const firstName = escapeHtml(userName.trim().split(/\s+/)[0] || '');
      const { error } = await resend.emails.send({
        from: WELCOME_FROM,
        ...(REPLY_TO ? { replyTo: REPLY_TO } : {}),
        to: userEmail,
        attachments: LOGO_ATTACHMENTS,
        subject: 'Boas-vindas ao Almanaque da Fala',
        html: baseTemplate(`
          <p>Olá${firstName ? `, ${firstName}` : ''}!</p>
          <p>Que bom ter você por aqui! Eu sei como é a rotina de preparar materiais para cada sessão, e foi por isso que criei o Almanaque da Fala.</p>
          <p>Aqui você encontra atividades prontas para imprimir, organizadas por fonema e faixa etária. Toda semana eu adiciono materiais novos.</p>
          ${infoBox(`
            <strong>O que você pode fazer agora:</strong><br><br>
            &bull; Explorar a biblioteca por fonema<br>
            &bull; Baixar grátis ${FREE_SAMPLE_COUNT} atividades do fonema ${phonemeLabel(FREE_DEFAULT_PHONEME)}<br>
            &bull; Imprimir e usar direto na sessão
          `)}
          <p>Para baixar toda a biblioteca, é só assinar o plano Profissional quando quiser.</p>
          ${button(`${APP_URL}/dashboard/biblioteca`, 'Ver atividades')}
          <p>Se precisar de qualquer coisa, é só responder a este e-mail. Estou aqui para ajudar.</p>
          <p style="margin-top: 24px;">Um abraço,<br><strong>Eliane Mota</strong><br><span style="color: #64748b; font-size: 12px;">Fonoaudióloga, Almanaque da Fala</span></p>
        `),
      });
      // The Resend SDK returns failures in `error` instead of throwing.
      if (error) console.error('Welcome email failed:', error);
    } catch (error) {
      console.error('Welcome email failed:', error);
    }
  }

  /** Sent once when a checkout creates the Profissional subscription. */
  static async sendSubscriptionConfirmed(
    userEmail: string,
    userName: string,
    plan: SubscriptionEmailPlan
  ) {
    const period = plan.interval === 'year' ? 'anual' : 'mensal';
    const per = plan.interval === 'year' ? 'ano' : 'mês';
    await sendFromEliane('Subscription confirmed', {
      to: userEmail,
      subject: 'Sua assinatura do Almanaque da Fala está ativa',
      html: baseTemplate(`
        ${greeting(userName)}
        <p>Obrigada por assinar o Almanaque da Fala! Agora a biblioteca inteira é sua: todas as atividades, de todos os fonemas, prontas para baixar e imprimir.</p>
        ${infoBox(`
          <strong>Sua assinatura</strong><br><br>
          Plano Profissional ${period}: ${formatBRL(plan.amount)}/${per}<br>
          Próxima renovação: ${formatDateBR(plan.renewsAt)}
        `)}
        <p>Toda semana eu adiciono materiais novos, e eles já entram no seu plano.</p>
        ${button(`${APP_URL}/dashboard/biblioteca`, 'Abrir a biblioteca')}
        <p style="color: #64748b; font-size: 12px;">Você pode ver os recibos, trocar o cartão ou cancelar quando quiser em <a href="${APP_URL}/dashboard/profile?tab=assinatura" style="color: #64748b;">Minha assinatura</a>.</p>
        <p>Qualquer dúvida, é só responder a este e-mail.</p>
        ${SIGNATURE}
      `),
    });
  }

  /**
   * Sent when a subscription is cancelled.
   * - accessUntil set: cancelled at period end, access continues until then.
   * - accessUntil null: subscription has already ended (e.g. unpaid).
   */
  static async sendSubscriptionCancelled(
    userEmail: string,
    userName: string,
    accessUntil: Date | null
  ) {
    const status = accessUntil
      ? `<p>Confirmamos o cancelamento da sua assinatura. Você continua com acesso a toda a biblioteca até <strong>${formatDateBR(accessUntil)}</strong>, e não haverá novas cobranças.</p>`
      : `<p>Sua assinatura do plano Profissional foi encerrada e não haverá novas cobranças.</p>`;
    await sendFromEliane('Subscription cancelled', {
      to: userEmail,
      subject: 'Sua assinatura foi cancelada',
      html: baseTemplate(`
        ${greeting(userName)}
        ${status}
        <p>Sua conta continua ativa. ${accessUntil ? 'Depois dessa data, você' : 'Você'} ainda pode baixar grátis as ${FREE_SAMPLE_COUNT} atividades do fonema ${phonemeLabel(FREE_DEFAULT_PHONEME)}.</p>
        <p>Se quiser voltar, é só assinar de novo. Tudo continua no mesmo lugar.</p>
        ${button(`${APP_URL}/dashboard/profile?tab=assinatura`, 'Ver minha assinatura')}
        <p>Se puder, me conte por que cancelou respondendo a este e-mail. Isso me ajuda muito a melhorar o Almanaque.</p>
        ${SIGNATURE}
      `),
    });
  }

  static async sendDownloadLimitWarning(
    userEmail: string,
    userName: string,
    remaining: number
  ) {
    try {
      await resend.emails.send({
        from: 'Almanaque da Fala <noreply@almanaquedafala.com.br>',
        to: userEmail,
        attachments: LOGO_ATTACHMENTS,
        subject: `Resta ${remaining} download${remaining > 1 ? 's' : ''} este mes`,
        html: baseTemplate(`
          <p>Ola ${userName},</p>
          <p>Tem <strong>${remaining} download${remaining > 1 ? 's' : ''} restante${remaining > 1 ? 's' : ''}</strong> no seu plano gratuito este mes.</p>
          ${warningBox(`Apos atingir o limite, tera de aguardar ate ao proximo mes ou fazer upgrade para downloads ilimitados.`)}
          <p>O plano Profissional inclui downloads ilimitados, novos materiais toda semana e acesso prioritario.</p>
          ${button(`${APP_URL}/#assinatura`, 'Ver plano Profissional')}
        `),
      });
    } catch (error) {
      console.error('Download limit warning email failed:', error);
    }
  }

  static async sendDownloadLimitReached(userEmail: string, userName: string) {
    try {
      await resend.emails.send({
        from: 'Almanaque da Fala <noreply@almanaquedafala.com.br>',
        to: userEmail,
        attachments: LOGO_ATTACHMENTS,
        subject: 'Limite de downloads atingido',
        html: baseTemplate(`
          <p>Ola ${userName},</p>
          <p>Atingiu o limite de 3 downloads gratuitos este mes.</p>
          ${infoBox(`O seu limite sera renovado automaticamente no proximo mes.`)}
          <p>Para continuar a descarregar materiais agora, faca upgrade para o plano Profissional:</p>
          ${button(`${APP_URL}/#assinatura`, 'Fazer upgrade')}
          <p style="color: #64748b; font-size: 12px;">Pode continuar a navegar e visualizar atividades normalmente.</p>
        `),
      });
    } catch (error) {
      console.error('Download limit reached email failed:', error);
    }
  }

  /** Tells the DPO a correction request is waiting (LGPD: answer within 15 days). */
  static async sendCorrectionRequestToDpo(input: {
    dpoEmail: string;
    userEmail: string;
    userName: string;
    description: string;
    requestId: string;
  }) {
    await sendFromEliane('Correction request (DPO)', {
      to: input.dpoEmail,
      subject: 'Nova solicitação de correção de dados (LGPD)',
      html: baseTemplate(`
        <p>Nova solicitação de correção de dados.</p>
        ${infoBox(
          `<strong>${escapeHtml(input.userName)}</strong> (${escapeHtml(input.userEmail)})<br><br>${escapeHtml(input.description).replace(/\n/g, '<br>')}`
        )}
        <p>Responda pelo painel de administração (solicitações de correção). Prazo legal: 15 dias.</p>
        <p style="color: #64748b; font-size: 12px;">Protocolo: ${escapeHtml(input.requestId)}</p>
      `),
    });
  }

  /** Tells the user their correction request was answered. */
  static async sendCorrectionRequestAnswered(input: {
    userEmail: string;
    userName: string;
    status: 'RESOLVED' | 'REJECTED';
    resolutionNote: string;
  }) {
    const firstName = escapeHtml(input.userName.trim().split(/\s+/)[0] || '');
    await sendFromEliane('Correction request (user)', {
      to: input.userEmail,
      subject:
        input.status === 'RESOLVED'
          ? 'Sua solicitação de correção foi atendida'
          : 'Resposta à sua solicitação de correção',
      html: baseTemplate(`
        <p>Olá${firstName ? ` ${firstName}` : ''},</p>
        <p>${
          input.status === 'RESOLVED'
            ? 'Atendemos a sua solicitação de correção de dados.'
            : 'Analisamos a sua solicitação de correção de dados e não foi possível atendê-la como pedido.'
        }</p>
        ${infoBox(escapeHtml(input.resolutionNote).replace(/\n/g, '<br>'))}
        <p style="color: #64748b; font-size: 12px;">Dúvidas? Responda este email.</p>
      `),
    });
  }
}
