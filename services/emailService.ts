import 'server-only'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export class EmailService {
  static async sendDownloadLimitWarning(userEmail: string, userName: string, remaining: number) {
    try {
      await resend.emails.send({
        from: 'FonoSaaS <noreply@fonosaas.com>',
        to: userEmail,
        subject: `⚠️ Restam apenas ${remaining} downloads gratuitos`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1f2937;">Olá ${userName}!</h2>
            
            <p>Você está quase atingindo seu limite mensal de downloads gratuitos.</p>
            
            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #92400e; margin: 0;">📊 Seu Status Atual:</h3>
              <p style="margin: 10px 0 0 0; color: #92400e;">
                <strong>${remaining} downloads restantes</strong> este mês
              </p>
            </div>
            
            <p>Para continuar baixando exercícios ilimitadamente, considere fazer upgrade para o plano Pro:</p>
            
            <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1e40af; margin: 0;">🚀 FonoSaaS Pro</h3>
              <ul style="color: #1e40af; margin: 10px 0;">
                <li>Downloads ilimitados</li>
                <li>Acesso a todos os exercícios</li>
                <li>Novos conteúdos semanais</li>
                <li>Suporte prioritário</li>
              </ul>
              <p style="margin: 15px 0 0 0;">
                <strong>Apenas R$ 39,90/mês</strong>
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
                 style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Fazer Upgrade Agora
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px;">
              Seus downloads são resetados todo mês. Continue aproveitando nossos exercícios!
            </p>
          </div>
        `
      })
    } catch (error) {
      console.error('Error sending download limit warning:', error)
    }
  }

  static async sendDownloadLimitReached(userEmail: string, userName: string) {
    try {
      await resend.emails.send({
        from: 'FonoSaaS <noreply@fonosaas.com>',
        to: userEmail,
        subject: '🚫 Limite de downloads atingido - Upgrade para Pro',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1f2937;">Olá ${userName}!</h2>
            
            <div style="background: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #dc2626; margin: 0;">🚫 Limite Atingido</h3>
              <p style="margin: 10px 0 0 0; color: #dc2626;">
                Você atingiu seu limite de <strong>5 downloads gratuitos</strong> este mês.
              </p>
            </div>
            
            <p>Não se preocupe! Você pode continuar baixando exercícios ilimitadamente com o plano Pro:</p>
            
            <div style="background: #dcfce7; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #16a34a; margin: 0;">✨ Upgrade para Pro</h3>
              <ul style="color: #16a34a; margin: 10px 0;">
                <li><strong>Downloads ilimitados</strong></li>
                <li>Acesso completo à biblioteca</li>
                <li>Novos exercícios toda semana</li>
                <li>Histórico completo de downloads</li>
                <li>Suporte prioritário</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
                 style="background: #16a34a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                Upgrade Agora - R$ 39,90/mês
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px;">
              Seus downloads gratuitos serão resetados no próximo mês. Mas com o Pro, você nunca mais se preocupa com limites!
            </p>
          </div>
        `
      })
    } catch (error) {
      console.error('Error sending download limit reached:', error)
    }
  }

  static async sendWelcomeEmail(userEmail: string, userName: string) {
    try {
      await resend.emails.send({
        from: 'FonoSaaS <noreply@fonosaas.com>',
        to: userEmail,
        subject: '🎉 Bem-vindo ao FonoSaaS!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1f2937;">Bem-vindo, ${userName}! 🎉</h2>
            
            <p>Estamos muito felizes em ter você na comunidade FonoSaaS!</p>
            
            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #0369a1; margin: 0;">🎯 Você tem direito a:</h3>
              <ul style="color: #0369a1; margin: 10px 0;">
                <li><strong>5 downloads gratuitos</strong> por mês</li>
                <li>Acesso a centenas de exercícios</li>
                <li>Histórico de downloads</li>
                <li>Perfil personalizado</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/games" 
                 style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Explorar Exercícios
              </a>
            </div>
            
            <p>Precisa de mais downloads? Considere o upgrade para Pro e tenha acesso ilimitado!</p>
            
            <p style="color: #6b7280; font-size: 14px;">
              Dúvidas? Responda este email que te ajudamos! 😊
            </p>
          </div>
        `
      })
    } catch (error) {
      console.error('Error sending welcome email:', error)
    }
  }
}
