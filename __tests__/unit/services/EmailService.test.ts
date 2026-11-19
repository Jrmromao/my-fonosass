//@ts-ignore
import { EmailService } from '@/services/emailService';

// Mock Resend
jest.mock('resend', () => {
  const mockSend = jest.fn();
  return {
    Resend: jest.fn(() => ({
      emails: {
        send: mockSend,
      },
    })),
    mockSend,
  };
});

describe('EmailService', () => {
  const { mockSend } = require('resend');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendWelcomeEmail', () => {
    const sentHtml = async (name = 'Ana Souza') => {
      mockSend.mockResolvedValue({ id: 'email_1', error: null });
      await EmailService.sendWelcomeEmail('ana@example.com', name);
      return mockSend.mock.calls[0][0] as {
        to: string;
        subject: string;
        html: string;
      };
    };

    it('greets by first name and sends the welcome subject', async () => {
      const mail = await sentHtml();
      expect(mail.to).toBe('ana@example.com');
      expect(mail.subject).toBe('Boas-vindas ao Almanaque da Fala');
      expect(mail.html).toContain('Olá, Ana!');
    });

    it('promises monthly updates, not weekly', async () => {
      const { html } = await sentHtml();
      expect(html).toContain(
        'todo mês entram atividades novas no plano, sem custo extra'
      );
      expect(html).not.toMatch(/semana/i);
    });

    it('does not mention age range', async () => {
      const { html } = await sentHtml();
      expect(html).not.toMatch(/faixa et/i);
    });

    it('escapes the name', async () => {
      const { html } = await sentHtml('<b>Ana</b>');
      expect(html).not.toContain('<b>Ana</b>');
    });
  });
});
