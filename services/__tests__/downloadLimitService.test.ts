import { DownloadLimitService } from '../downloadLimitService'
import { prisma } from '@/app/db'

// Mock email service
jest.mock('../emailService', () => ({
  EmailService: {
    sendDownloadLimitWarning: jest.fn(),
    sendDownloadLimitReached: jest.fn(),
  }
}))

// Mock Prisma
jest.mock('@/app/db', () => ({
  prisma: {
    downloadLimit: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
    },
    downloadHistory: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    activity: {
      findUnique: jest.fn(),
    },
  },
}))

const mockPrisma = prisma as jest.Mocked<typeof prisma>

describe('DownloadLimitService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('checkDownloadLimit', () => {
    it('should create new limit record for new user', async () => {
      mockPrisma.downloadLimit.findUnique.mockResolvedValue(null)
      mockPrisma.downloadLimit.create.mockResolvedValue({
        id: '1',
        userId: 'user1',
        downloads: 0,
        resetDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const result = await DownloadLimitService.checkDownloadLimit('user1')

      expect(result).toEqual({ canDownload: true, remaining: 5 })
      expect(mockPrisma.downloadLimit.create).toHaveBeenCalledWith({
        data: { userId: 'user1', downloads: 0 }
      })
    })

    it('should allow download when under limit', async () => {
      const mockLimit = {
        id: '1',
        userId: 'user1',
        downloads: 3,
        resetDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      mockPrisma.downloadLimit.findUnique.mockResolvedValue(mockLimit)

      const result = await DownloadLimitService.checkDownloadLimit('user1')

      expect(result).toEqual({ canDownload: true, remaining: 2 })
    })

    it('should deny download when limit reached', async () => {
      const mockLimit = {
        id: '1',
        userId: 'user1',
        downloads: 5,
        resetDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      mockPrisma.downloadLimit.findUnique.mockResolvedValue(mockLimit)

      const result = await DownloadLimitService.checkDownloadLimit('user1')

      expect(result).toEqual({ canDownload: false, remaining: 0 })
    })

    it('should reset downloads after 30 days', async () => {
      const oldDate = new Date()
      oldDate.setDate(oldDate.getDate() - 31) // 31 days ago

      const mockLimit = {
        id: '1',
        userId: 'user1',
        downloads: 5,
        resetDate: oldDate,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      mockPrisma.downloadLimit.findUnique.mockResolvedValue(mockLimit)
      mockPrisma.downloadLimit.update.mockResolvedValue(mockLimit)

      const result = await DownloadLimitService.checkDownloadLimit('user1')

      expect(result).toEqual({ canDownload: true, remaining: 5 })
      expect(mockPrisma.downloadLimit.update).toHaveBeenCalledWith({
        where: { userId: 'user1' },
        data: { downloads: 0, resetDate: expect.any(Date) }
      })
    })
  })

  describe('recordDownload', () => {
    it('should increment download count and record history', async () => {
      mockPrisma.downloadHistory.create.mockResolvedValue({
        id: '1',
        userId: 'user1',
        activityId: 'activity1',
        fileName: 'test.pdf',
        fileSize: 1024,
        downloadedAt: new Date(),
        ipAddress: '127.0.0.1',
        userAgent: 'test-agent'
      } as any)

      mockPrisma.downloadLimit.upsert.mockResolvedValue({
        id: '1',
        userId: 'user1',
        downloads: 1,
        resetDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user1',
        email: 'user@test.com',
        fullName: 'Test User'
      } as any)

      await DownloadLimitService.recordDownload('user1', 'activity1', 'test.pdf', 1024, '127.0.0.1', 'test-agent')

      expect(mockPrisma.downloadHistory.create).toHaveBeenCalledWith({
        data: {
          userId: 'user1',
          activityId: 'activity1',
          fileName: 'test.pdf',
          fileSize: 1024,
          ipAddress: '127.0.0.1',
          userAgent: 'test-agent'
        }
      })

      expect(mockPrisma.downloadLimit.upsert).toHaveBeenCalledWith({
        where: { userId: 'user1' },
        update: { downloads: { increment: 1 } },
        create: { userId: 'user1', downloads: 1 }
      })
    })

    it('should send warning email when 1 download remaining', async () => {
      const mockEmailService = {
        sendDownloadLimitWarning: jest.fn()
      }

      // Mock dynamic import
      jest.doMock('../emailService', () => ({
        EmailService: mockEmailService
      }))

      mockPrisma.downloadHistory.create.mockResolvedValue({} as any)
      mockPrisma.downloadLimit.upsert.mockResolvedValue({
        downloads: 4 // 5 - 4 = 1 remaining
      } as any)
      mockPrisma.user.findUnique.mockResolvedValue({
        email: 'user@test.com',
        fullName: 'Test User'
      } as any)

      await DownloadLimitService.recordDownload('user1', 'activity1', 'test.pdf')

      expect(mockEmailService.sendDownloadLimitWarning).toHaveBeenCalledWith(
        'user@test.com',
        'Test User',
        1
      )
    })

    it('should send limit reached email when 0 downloads remaining', async () => {
      const mockEmailService = {
        sendDownloadLimitReached: jest.fn()
      }

      jest.doMock('../emailService', () => ({
        EmailService: mockEmailService
      }))

      mockPrisma.downloadHistory.create.mockResolvedValue({} as any)
      mockPrisma.downloadLimit.upsert.mockResolvedValue({
        downloads: 5 // 5 - 5 = 0 remaining
      } as any)
      mockPrisma.user.findUnique.mockResolvedValue({
        email: 'user@test.com',
        fullName: 'Test User'
      } as any)

      await DownloadLimitService.recordDownload('user1', 'activity1', 'test.pdf')

      expect(mockEmailService.sendDownloadLimitReached).toHaveBeenCalledWith(
        'user@test.com',
        'Test User'
      )
    })

    it('should not send email if user not found', async () => {
      mockPrisma.downloadHistory.create.mockResolvedValue({} as any)
      mockPrisma.downloadLimit.upsert.mockResolvedValue({
        downloads: 4
      } as any)
      mockPrisma.user.findUnique.mockResolvedValue(null)

      // Should not throw error
      await expect(DownloadLimitService.recordDownload('user1', 'activity1', 'test.pdf')).resolves.not.toThrow()
    })
  })

  describe('hasProAccess', () => {
    it('should return true for active subscription', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user1',
        subscriptionStatus: 'ACTIVE'
      } as any)

      const result = await DownloadLimitService.hasProAccess('user1')

      expect(result).toBe(true)
    })

    it('should return false for inactive subscription', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user1',
        subscriptionStatus: 'INACTIVE'
      } as any)

      const result = await DownloadLimitService.hasProAccess('user1')

      expect(result).toBe(false)
    })

    it('should return false for user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)

      const result = await DownloadLimitService.hasProAccess('user1')

      expect(result).toBe(false)
    })
  })
})
