import S3Service from '@/services/S3Service'
import { GetObjectCommand } from '@aws-sdk/client-s3'

export interface WaitingListEntry {
  email: string
  date: string
  ip_address: string
}

export class WaitingListManager {
  private s3Service: S3Service

  constructor() {
    this.s3Service = S3Service.getInstance()
  }

  /**
   * Get all waiting list entries from S3
   */
  async getAllEntries(): Promise<WaitingListEntry[]> {
    try {
      // Get the latest daily JSON file
      const today = new Date().toISOString().split('T')[0]
      const jsonKey = `waiting-list/daily/waiting-list-${today}.json`
      
      const command = new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: jsonKey,
      })

      const response = await this.s3Service['s3Client'].send(command)
      const content = await response.Body?.transformToString()
      
      if (content) {
        return JSON.parse(content)
      }
      
      return []
    } catch (error) {
      console.error('Error fetching waiting list entries from S3:', error)
      return []
    }
  }

  /**
   * Get waiting list entries for a specific date
   */
  async getEntriesForDate(date: string): Promise<WaitingListEntry[]> {
    try {
      const jsonKey = `waiting-list/daily/waiting-list-${date}.json`
      
      const command = new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: jsonKey,
      })

      const response = await this.s3Service['s3Client'].send(command)
      const content = await response.Body?.transformToString()
      
      if (content) {
        return JSON.parse(content)
      }
      
      return []
    } catch (error) {
      console.error(`Error fetching waiting list entries for ${date}:`, error)
      return []
    }
  }

  /**
   * Export waiting list data as CSV
   */
  async exportAsCSV(date?: string): Promise<string> {
    try {
      const entries = date ? await this.getEntriesForDate(date) : await this.getAllEntries()
      
      const csvHeader = 'email,date,ip_address\n'
      const csvRows = entries.map(entry => 
        `"${entry.email}","${entry.date}","${entry.ip_address}"`
      ).join('\n')
      
      return csvHeader + csvRows
    } catch (error) {
      console.error('Error exporting waiting list as CSV:', error)
      throw error
    }
  }

  /**
   * Get statistics about the waiting list
   */
  async getStatistics(): Promise<{
    totalEntries: number
    entriesByDate: Record<string, number>
    uniqueEmails: number
  }> {
    try {
      const entries = await this.getAllEntries()
      const uniqueEmails = new Set(entries.map(entry => entry.email))
      
      const entriesByDate: Record<string, number> = {}
      entries.forEach(entry => {
        const date = entry.date.split('T')[0]
        entriesByDate[date] = (entriesByDate[date] || 0) + 1
      })
      
      return {
        totalEntries: entries.length,
        entriesByDate,
        uniqueEmails: uniqueEmails.size
      }
    } catch (error) {
      console.error('Error getting waiting list statistics:', error)
      throw error
    }
  }
}

export const waitingListManager = new WaitingListManager()
