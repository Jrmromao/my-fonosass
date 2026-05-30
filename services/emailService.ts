import { Resend } from 'resend';
import 'server-only';

const resend = new Resend(process.env.RESEND_API_KEY);
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.almanaquedafala.com.br';

// ─── Base Template ────────────────────────────────────────────

function baseTemplate(content: string) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; padding: 40px 20px; margin: 0;">
  <div style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 4px; overflow: hidden;">

    <!-- Header -->
    <div style="padding: 28px 40px; text-align: center;">
      <span style="font-family: 'Nunito', 'Georgia', serif; font-size: 22px; font-weight: 700; color: #1e293b; letter-spacing: -0.02em;">Almanaque da Fala</span>
    </div>

    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 0 40px;" />

    <!-- Content -->
    <div style="padding: 32px 40px; font-size: 14px; line-height: 1.7; color: #334155;">
      ${content}
    </div>

    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 0 40px;" />

    <!-- Footer -->
    <div style="padding: 24px 40px; text-align: center;">
      <p style="color: #94a3b8; font-size: 11px; margin: 0 0 8px 0;">
        <a href="${APP_URL}/privacidade" style="color: #94a3b8; text-decoration: none;">Privacidade</a>
        &nbsp;&middot;&nbsp;
        <a href="${APP_URL}/faq" style="color: #94a3b8; text-decoration: none;">FAQ</a>
        &nbsp;&middot;&nbsp;
        <a href="${APP_URL}/contato" style="color: #94a3b8; text-decoration: none;">Contacto</a>
      </p>
      <p style="color: #cbd5e1; font-size: 11px; margin: 0;">
        &copy; ${new Date().getFullYear()} Almanaque da Fala. Todos os direitos reservados.
      </p>
    </div>
  </div>
</body>
</html>`;
}

function button(href: string, text: string) {
  return `<div style="text-align: center; margin: 28px 0;">
    <a href="${href}" style="background-color: #1e293b; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; font-size: 14px;">
      ${text}
    </a>
  </div>`;
}

function infoBox(content: string) {
  return `<div style="background: #f8fafc; border-radius: 6px; padding: 16px 20px; margin: 20px 0; font-size: 13px;">${content}</div>`;
}

function warningBox(content: string) {
  return `<div style="background: #fef2f2; border-left: 3px solid #f97066; border-radius: 4px; padding: 16px 20px; margin: 20px 0;">
    <p style="color: #991b1b; font-size: 13px; line-height: 1.6; margin: 0;">${content}</p>
  </div>`;
}

// ─── Email Methods ────────────────────────────────────────────

export class EmailService {
  static async sendWelcomeEmail(userEmail: string, userName: string) {
    try {
      await resend.emails.send({
        from: 'Almanaque da Fala <noreply@almanaquedafala.com.br>',
        to: userEmail,
        subject: 'Bem-vindo ao Almanaque da Fala',
        html: baseTemplate(`
          <h2 style="color: #1e293b; font-size: 20px; margin: 0 0 16px 0;">Bem-vindo, ${userName}!</h2>
          <p>A sua conta foi criada com sucesso. Agora tem acesso a materiais terapeuticos prontos para usar nas suas sessoes.</p>
          ${infoBox(`
            <strong>O seu plano gratuito inclui:</strong><br>
            3 downloads por mes &middot; Acesso a toda a biblioteca &middot; Visualizacao de atividades
          `)}
          <p>Explore a biblioteca e encontre atividades organizadas por fonema, faixa etaria e dificuldade.</p>
          ${button(`${APP_URL}/dashboard/games`, 'Explorar atividades')}
          <p style="color: #64748b; font-size: 12px;">Se tiver alguma duvida, responda a este email ou visite a nossa <a href="${APP_URL}/faq" style="color: #1e293b;">pagina de FAQ</a>.</p>
        `),
      });
    } catch (error) {
      console.error('Welcome email failed:', error);
    }
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
}
