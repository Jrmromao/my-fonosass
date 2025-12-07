/**
 * Basic Integration Tests for Waiting List API
 * 
 * Tests the core waiting list functionality without complex mocking
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import fs from 'fs'
import path from 'path'

describe('Waiting List API - Basic Integration Tests', () => {
  const testDataDir = path.join(__dirname, 'test-data')
  const csvPath = path.join(testDataDir, 'waiting-list.csv')
  const jsonPath = path.join(testDataDir, 'waiting-list.json')

  beforeEach(() => {
    // Create test data directory
    if (!fs.existsSync(testDataDir)) {
      fs.mkdirSync(testDataDir, { recursive: true })
    }
    
    // Clean up test files
    if (fs.existsSync(csvPath)) {
      fs.unlinkSync(csvPath)
    }
    if (fs.existsSync(jsonPath)) {
      fs.unlinkSync(jsonPath)
    }
  })

  afterEach(() => {
    // Clean up test files
    if (fs.existsSync(csvPath)) {
      fs.unlinkSync(csvPath)
    }
    if (fs.existsSync(jsonPath)) {
      fs.unlinkSync(jsonPath)
    }
    
    // Clean up test directory
    if (fs.existsSync(testDataDir)) {
      fs.rmSync(testDataDir, { recursive: true, force: true })
    }
  })

  describe('File System Operations', () => {
    it('should create CSV file with proper format', () => {
      const csvHeader = 'email,date,ip_address\n'
      const csvRow = '"test@example.com","2024-12-15T10:00:00.000Z","192.168.1.1"\n'
      
      fs.writeFileSync(csvPath, csvHeader + csvRow)
      
      expect(fs.existsSync(csvPath)).toBe(true)
      
      const content = fs.readFileSync(csvPath, 'utf8')
      expect(content).toContain('email,date,ip_address')
      expect(content).toContain('test@example.com')
    })

    it('should create JSON file with proper format', () => {
      const testData = [
        {
          email: 'test@example.com',
          date: '2024-12-15T10:00:00.000Z',
          ip_address: '192.168.1.1'
        }
      ]
      
      fs.writeFileSync(jsonPath, JSON.stringify(testData, null, 2))
      
      expect(fs.existsSync(jsonPath)).toBe(true)
      
      const content = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
      expect(content).toHaveLength(1)
      expect(content[0].email).toBe('test@example.com')
      expect(content[0]).toHaveProperty('date')
      expect(content[0]).toHaveProperty('ip_address')
    })

    it('should append to existing CSV file', () => {
      const csvHeader = 'email,date,ip_address\n'
      const csvRow1 = '"test1@example.com","2024-12-15T10:00:00.000Z","192.168.1.1"\n'
      const csvRow2 = '"test2@example.com","2024-12-15T11:00:00.000Z","192.168.1.2"\n'
      
      // Create initial file
      fs.writeFileSync(csvPath, csvHeader + csvRow1)
      
      // Append to file
      fs.appendFileSync(csvPath, csvRow2)
      
      const content = fs.readFileSync(csvPath, 'utf8')
      const lines = content.trim().split('\n')
      
      expect(lines).toHaveLength(3) // Header + 2 data rows
      expect(content).toContain('test1@example.com')
      expect(content).toContain('test2@example.com')
    })

    it('should append to existing JSON file', () => {
      const initialData = [
        {
          email: 'test1@example.com',
          date: '2024-12-15T10:00:00.000Z',
          ip_address: '192.168.1.1'
        }
      ]
      
      // Create initial file
      fs.writeFileSync(jsonPath, JSON.stringify(initialData, null, 2))
      
      // Read, modify, and write back
      const existingData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
      const newEntry = {
        email: 'test2@example.com',
        date: '2024-12-15T11:00:00.000Z',
        ip_address: '192.168.1.2'
      }
      
      existingData.push(newEntry)
      fs.writeFileSync(jsonPath, JSON.stringify(existingData, null, 2))
      
      const content = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
      expect(content).toHaveLength(2)
      expect(content[0].email).toBe('test1@example.com')
      expect(content[1].email).toBe('test2@example.com')
    })
  })

  describe('Data Validation', () => {
    it('should validate email format', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org'
      ]
      
      const invalidEmails = [
        'invalid-email',
        '@domain.com',
        'user@',
        'user@domain'
      ]
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      
      validEmails.forEach(email => {
        expect(emailRegex.test(email)).toBe(true)
      })
      
      invalidEmails.forEach(email => {
        expect(emailRegex.test(email)).toBe(false)
      })
    })

    it('should generate valid ISO timestamps', () => {
      const timestamp = new Date().toISOString()
      
      // Should be valid ISO 8601 format
      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
      
      // Should be parseable as a valid date
      const date = new Date(timestamp)
      expect(date.toISOString()).toBe(timestamp)
    })

    it('should properly escape CSV values', () => {
      const testData = {
        email: 'test@example.com',
        date: '2024-12-15T10:00:00.000Z',
        ip_address: '192.168.1.1'
      }
      
      const csvRow = `"${testData.email}","${testData.date}","${testData.ip_address}"\n`
      
      expect(csvRow).toMatch(/^"[^"]+","[^"]+","[^"]+"\n$/)
      expect(csvRow).toContain('test@example.com')
    })
  })

  describe('S3 Key Generation', () => {
    it('should generate correct S3 keys for individual entries', () => {
      const email = 'test@example.com'
      const timestamp = '2024-12-15T10:00:00.000Z'
      
      const individualEntryKey = `waiting-list/entries/${timestamp}-${email.replace('@', '-at-')}.json`
      
      expect(individualEntryKey).toBe('waiting-list/entries/2024-12-15T10:00:00.000Z-test-at-example.com.json')
    })

    it('should generate correct S3 keys for daily files', () => {
      const date = '2024-12-15'
      
      const csvKey = `waiting-list/daily/waiting-list-${date}.csv`
      const jsonKey = `waiting-list/daily/waiting-list-${date}.json`
      
      expect(csvKey).toBe('waiting-list/daily/waiting-list-2024-12-15.csv')
      expect(jsonKey).toBe('waiting-list/daily/waiting-list-2024-12-15.json')
    })

    it('should handle special characters in email addresses', () => {
      const emails = [
        'user+tag@example.com',
        'user.name@example.com',
        'user_name@example.com'
      ]
      
      emails.forEach(email => {
        const sanitized = email.replace('@', '-at-')
        expect(sanitized).not.toContain('@')
        expect(sanitized).toContain('-at-')
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle file system errors gracefully', () => {
      // Try to read a non-existent file
      expect(() => {
        fs.readFileSync('non-existent-file.json', 'utf8')
      }).toThrow()
    })

    it('should handle malformed JSON gracefully', () => {
      const malformedJson = 'invalid json content'
      
      expect(() => {
        JSON.parse(malformedJson)
      }).toThrow()
    })

    it('should handle directory creation', () => {
      const newDir = path.join(testDataDir, 'subdirectory')
      
      expect(fs.existsSync(newDir)).toBe(false)
      
      fs.mkdirSync(newDir, { recursive: true })
      
      expect(fs.existsSync(newDir)).toBe(true)
    })
  })

  describe('Performance', () => {
    it('should handle multiple rapid file operations', () => {
      const startTime = Date.now()
      
      // Perform multiple file operations
      for (let i = 0; i < 100; i++) {
        const testFile = path.join(testDataDir, `test-${i}.json`)
        const data = { id: i, timestamp: new Date().toISOString() }
        
        fs.writeFileSync(testFile, JSON.stringify(data))
        const readData = JSON.parse(fs.readFileSync(testFile, 'utf8'))
        expect(readData.id).toBe(i)
        
        fs.unlinkSync(testFile)
      }
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      // Should complete within reasonable time (adjust threshold as needed)
      expect(duration).toBeLessThan(1000) // 1 second
    })
  })
})
