import 'server-only';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_REVIEWER_CHAT_ID;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export class TelegramService {
  private static baseUrl() {
    return `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;
  }

  static async sendExerciseForReview(exercise: {
    id: string;
    name: string;
    phoneme: string;
    difficulty: string;
    ageRange: string;
    approvalToken: string;
  }) {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.warn('Telegram not configured, skipping notification');
      return;
    }

    const reviewUrl = `${APP_URL}/dashboard/exercises/review/${exercise.id}?token=${exercise.approvalToken}`;
    const approveUrl = `${APP_URL}/api/exercises/${exercise.id}/approve?token=${exercise.approvalToken}`;

    const message = `🆕 *Novo Exercício para Revisão*

📝 *${exercise.name}*
🔤 Fonema: /${exercise.phoneme}/
📊 Dificuldade: ${exercise.difficulty}
👶 Faixa etária: ${exercise.ageRange}

[👁 Ver exercício](${reviewUrl})`;

    const response = await fetch(`${this.baseUrl()}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '✅ Aprovar', url: approveUrl },
              { text: '👁 Ver detalhes', url: reviewUrl },
            ],
          ],
        },
      }),
    });

    if (!response.ok) {
      console.error('Telegram send failed:', await response.text());
    }

    return response.ok;
  }
}
