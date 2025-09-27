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
        from: 'Almanaque da Fala <noreply@almanaquedafala.com.br>',
        to: 'user@test.com',
        subject: '⚠️ Restam apenas 1 downloads gratuitos',
        html: expect.stringContaining('Olá João Silva!'),
      });
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('1 downloads restantes'),
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
        'Error sending download limit warning:',
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
        from: 'Almanaque da Fala <noreply@almanaquedafala.com.br>',
        to: 'user@test.com',
        subject: '🚫 Limite de downloads atingido - Upgrade para Pro',
        html: expect.stringContaining('Olá Maria Santos!'),
      });
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('Upgrade Agora - R$ 39,90/mês'),
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
        'Error sending download limit reached:',
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
        from: 'Almanaque da Fala <noreply@almanaquedafala.com.br>',
        to: 'newuser@test.com',
        subject: '🎉 Bem-vindo ao Almanaque da Fala!',
        html: expect.stringContaining('Bem-vindo, Pedro Costa!'),
      });
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('5 downloads gratuitos'),
        })
      );
    });

    it('should include correct CTA links', async () => {
      process.env.NEXT_PUBLIC_APP_URL = 'https://test.com';
      mockSend.mockResolvedValue({ id: 'email-id' });

      await EmailService.sendWelcomeEmail('newuser@test.com', 'Pedro Costa');

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('https://test.com/dashboard/games'),
        })
      );
    });

    it('should handle email sending errors gracefully', async () => {
      mockSend.mockRejectedValue(new Error('Email service error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await EmailService.sendWelcomeEmail('newuser@test.com', 'Pedro Costa');

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error sending welcome email:',
        expect.any(Error)
      );
      consoleSpy.mockRestore();
    });
  });
});
