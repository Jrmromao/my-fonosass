import { GET, POST } from '../route'
import { auth } from '@clerk/nextjs/server'
import { DownloadLimitService } from '@/services/downloadLimitService'

// Mock dependencies
jest.mock('@clerk/nextjs/server')
jest.mock('@/services/downloadLimitService')

const mockAuth = auth as jest.MockedFunction<typeof auth>
const mockDownloadLimitService = DownloadLimitService as jest.Mocked<typeof DownloadLimitService>

describe('/api/download-limit', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    it('should return 401 for unauthenticated user', async () => {
      mockAuth.mockResolvedValue({ userId: null } as any)

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return unlimited downloads for Pro user', async () => {
      mockAuth.mockResolvedValue({ userId: 'user1' } as any)
      mockDownloadLimitService.hasProAccess.mockResolvedValue(true)

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual({
        canDownload: true,
        remaining: -1,
        isPro: true
      })
    })

    it('should return download limits for free user', async () => {
      mockAuth.mockResolvedValue({ userId: 'user1' } as any)
      mockDownloadLimitService.hasProAccess.mockResolvedValue(false)
      mockDownloadLimitService.checkDownloadLimit.mockResolvedValue({
        canDownload: true,
        remaining: 3
      })

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual({
        canDownload: true,
        remaining: 3,
        isPro: false
      })
    })

    it('should handle service errors', async () => {
      mockAuth.mockResolvedValue({ userId: 'user1' } as any)
      mockDownloadLimitService.hasProAccess.mockRejectedValue(new Error('DB Error'))

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Internal server error')
    })
  })

  describe('POST', () => {
    it('should return 401 for unauthenticated user', async () => {
      mockAuth.mockResolvedValue({ userId: null } as any)

      const response = await POST()
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should allow unlimited downloads for Pro user', async () => {
      mockAuth.mockResolvedValue({ userId: 'user1' } as any)
      mockDownloadLimitService.hasProAccess.mockResolvedValue(true)

      const response = await POST()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual({
        downloaded: true,
        isPro: true
      })
      expect(mockDownloadLimitService.recordDownload).not.toHaveBeenCalled()
    })

    it('should record download for free user within limit', async () => {
      mockAuth.mockResolvedValue({ userId: 'user1' } as any)
      mockDownloadLimitService.hasProAccess.mockResolvedValue(false)
      mockDownloadLimitService.checkDownloadLimit.mockResolvedValue({
        canDownload: true,
        remaining: 2
      })
      mockDownloadLimitService.recordDownload.mockResolvedValue()

      const response = await POST()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual({
        downloaded: true,
        remaining: 1
      })
      expect(mockDownloadLimitService.recordDownload).toHaveBeenCalledWith('user1')
    })

    it('should deny download when limit reached', async () => {
      mockAuth.mockResolvedValue({ userId: 'user1' } as any)
      mockDownloadLimitService.hasProAccess.mockResolvedValue(false)
      mockDownloadLimitService.checkDownloadLimit.mockResolvedValue({
        canDownload: false,
        remaining: 0
      })

      const response = await POST()
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Download limit reached. Upgrade to Pro for unlimited downloads.')
      expect(mockDownloadLimitService.recordDownload).not.toHaveBeenCalled()
    })
  })
})
