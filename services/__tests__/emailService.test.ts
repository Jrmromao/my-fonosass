// Mock server-only module
jest.mock('server-only', () => ({}), { virtual: true });

// Mock Resend properly
jest.mock('resend', () => {
  const mockSend = jest.fn();
  return {
    Resend: jest.fn().mockImplementation(() => ({
      emails: {
        send: mockSend,
      },
    })),
    mockSend, // Export mockSend to be accessible in tests
  };
});

import { EmailService } from '../emailService';

// Get the mockSend function from the mocked module
const { mockSend } = require('resend');

describe('EmailService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendDownloadLimitWarning', () => {
    it('should send warning email with correct content', async () => {
      mockSend.mockResolvedValue({ id: 'email-id' });

      await EmailService.sendDownloadLimitWarning(
        'user@test.com',
        'João Silva',
        1
      );

      expect(mockSend).toHaveBeenCalledWith({
        attachments: expect.any(Array),
        from: 'Almanaque da Fala <noreply@almanaquedafala.com.br>',
        to: 'user@test.com',
        subject: 'Resta 1 download este mes',
        html: expect.stringContaining('Ola João Silva,'),
      });
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('1 download restante'),
        })
      );
    });

    it('should handle email sending errors gracefully', async () => {
      mockSend.mockRejectedValue(new Error('Email service error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await EmailService.sendDownloadLimitWarning(
        'user@test.com',
        'João Silva',
        1
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        'Download limit warning email failed:',
        expect.any(Error)
      );
      consoleSpy.mockRestore();
    });
  });

  describe('sendDownloadLimitReached', () => {
    it('should send limit reached email with upgrade CTA', async () => {
      mockSend.mockResolvedValue({ id: 'email-id' });

      await EmailService.sendDownloadLimitReached(
        'user@test.com',
        'Maria Santos'
      );

      expect(mockSend).toHaveBeenCalledWith({
        attachments: expect.any(Array),
        from: 'Almanaque da Fala <noreply@almanaquedafala.com.br>',
        to: 'user@test.com',
        subject: 'Limite de downloads atingido',
        html: expect.stringContaining('Ola Maria Santos,'),
      });
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('Fazer upgrade'),
        })
      );
    });

    it('should handle email sending errors gracefully', async () => {
      mockSend.mockRejectedValue(new Error('Email service error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await EmailService.sendDownloadLimitReached(
        'user@test.com',
        'Maria Santos'
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        'Download limit reached email failed:',
        expect.any(Error)
      );
      consoleSpy.mockRestore();
    });
  });

  describe('sendWelcomeEmail', () => {
    it('should send welcome email with onboarding content', async () => {
      mockSend.mockResolvedValue({ id: 'email-id' });

      await EmailService.sendWelcomeEmail('newuser@test.com', 'Pedro Costa');

      expect(mockSend).toHaveBeenCalledWith({
        attachments: expect.any(Array),
        from: 'Eliane Mota <noreply@almanaquedafala.com.br>',
        to: 'newuser@test.com',
        subject: 'Boas-vindas ao Almanaque da Fala',
        html: expect.stringContaining('Olá, Pedro!'),
      });
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining(
            'Baixar grátis 2 atividades do fonema /s/'
          ),
        })
      );
    });

    it('should be signed by Eliane Mota in pt-BR', async () => {
      mockSend.mockResolvedValue({ id: 'email-id' });

      await EmailService.sendWelcomeEmail('newuser@test.com', 'Pedro Costa');

      const { html } = mockSend.mock.calls[0][0];
      expect(html).toContain('<strong>Eliane Mota</strong>');
      expect(html).toContain('Um abraço');
      expect(html).not.toMatch(/por mês|Contacto/);
      expect(html).not.toMatch(/connosco|descarregar|\bvoce\b|\bOla\b/i);
    });

    it('should embed the logo inline (cid) instead of a remote URL', async () => {
      mockSend.mockResolvedValue({ id: 'email-id' });

      await EmailService.sendWelcomeEmail('newuser@test.com', 'Pedro Costa');

      const { html, attachments } = mockSend.mock.calls[0][0];
      expect(html).toContain('src="cid:almanaque-logo"');
      expect(attachments).toEqual([
        expect.objectContaining({
          contentId: 'almanaque-logo',
          filename: 'logo.png',
        }),
      ]);
    });

    it('should escape HTML in the user name', async () => {
      mockSend.mockResolvedValue({ id: 'email-id' });

      await EmailService.sendWelcomeEmail(
        'newuser@test.com',
        '<script>alert(1)</script> X'
      );

      const { html } = mockSend.mock.calls[0][0];
      expect(html).not.toContain('<script>');
      expect(html).toContain('&lt;script&gt;');
    });

    it('should include correct CTA links', async () => {
      mockSend.mockResolvedValue({ id: 'email-id' });

      await EmailService.sendWelcomeEmail('newuser@test.com', 'Pedro Costa');

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('/dashboard/biblioteca'),
        })
      );
    });

    it('should handle email sending errors gracefully', async () => {
      mockSend.mockRejectedValue(new Error('Email service error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await EmailService.sendWelcomeEmail('newuser@test.com', 'Pedro Costa');

      expect(consoleSpy).toHaveBeenCalledWith(
        'Welcome email failed:',
        expect.any(Error)
      );
      consoleSpy.mockRestore();
    });
  });
});
