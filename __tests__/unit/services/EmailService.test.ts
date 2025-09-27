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

  describe('sendDownloadLimitWarning', () => {
    it('should send download limit warning email successfully', async () => {
      const mockResponse = { id: 'email_123', error: null };
      mockSend.mockResolvedValue(mockResponse);

      await EmailService.sendDownloadLimitWarning(
        'test@example.com',
        'Test User',
        2
      );

      expect(mockSend).toHaveBeenCalledWith({
        from: 'Almanaque da Fala <noreply@almanaquedafala.com.br>',
        to: 'test@example.com',
        subject: '⚠️ Restam apenas 2 downloads gratuitos',
        html: expect.stringContaining('Test User'),
      });
    });

    it('should handle email sending errors gracefully', async () => {
      const mockError = new Error('Email sending failed');
      mockSend.mockRejectedValue(mockError);

      // The method should not throw, it should catch and log the error
      await expect(
        EmailService.sendDownloadLimitWarning(
          'test@example.com',
          'Test User',
          1
        )
      ).resolves.toBeUndefined();
    });

    it('should include correct remaining count in subject', async () => {
      const mockResponse = { id: 'email_123', error: null };
      mockSend.mockResolvedValue(mockResponse);

      await EmailService.sendDownloadLimitWarning(
        'test@example.com',
        'Test User',
        5
      );

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: '⚠️ Restam apenas 5 downloads gratuitos',
        })
      );
    });

    it('should include user name in email content', async () => {
      const mockResponse = { id: 'email_123', error: null };
      mockSend.mockResolvedValue(mockResponse);

      await EmailService.sendDownloadLimitWarning(
        'test@example.com',
        'John Doe',
        3
      );

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('Olá John Doe!'),
        })
      );
    });

    it('should include upgrade link in email content', async () => {
      const mockResponse = { id: 'email_123', error: null };
      mockSend.mockResolvedValue(mockResponse);

      await EmailService.sendDownloadLimitWarning(
        'test@example.com',
        'Test User',
        1
      );

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('Fazer Upgrade Agora'),
        })
      );
    });
  });
});
