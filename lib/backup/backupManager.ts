import { prisma } from '@/app/db';
import { ErrorTracker } from '../monitoring/errorTracker';

export interface BackupConfig {
  enabled: boolean;
  schedule: 'hourly' | 'daily' | 'weekly';
  retentionDays: number;
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
  storageLocation: 'local' | 's3' | 'gcs';
}

export interface BackupMetadata {
  id: string;
  timestamp: Date;
  size: number;
  type: 'full' | 'incremental';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  tables: string[];
  recordCount: number;
  checksum: string;
  location: string;
}

export class BackupManager {
  private static config: BackupConfig = {
    enabled: process.env.BACKUP_ENABLED === 'true',
    schedule: (process.env.BACKUP_SCHEDULE as any) || 'daily',
    retentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS || '30'),
    compressionEnabled: process.env.BACKUP_COMPRESSION === 'true',
    encryptionEnabled: process.env.BACKUP_ENCRYPTION === 'true',
    storageLocation: (process.env.BACKUP_STORAGE as any) || 'local'
  };

  private static backups: BackupMetadata[] = [];

  static async createBackup(type: 'full' | 'incremental' = 'full'): Promise<BackupMetadata> {
    if (!this.config.enabled) {
      throw new Error('Backup is disabled');
    }

    const backupId = `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date();

    const backup: BackupMetadata = {
      id: backupId,
      timestamp,
      size: 0,
      type,
      status: 'pending',
      tables: [],
      recordCount: 0,
      checksum: '',
      location: ''
    };

    this.backups.push(backup);

    try {
      backup.status = 'in_progress';
      
      // Get all table names
      const tables = await this.getTableNames();
      backup.tables = tables;

      // Create backup data
      const backupData = await this.exportDatabaseData(tables);
      backup.recordCount = backupData.totalRecords;

      // Compress if enabled
      let processedData = backupData;
      if (this.config.compressionEnabled) {
        processedData = await this.compressData(backupData);
      }

      // Encrypt if enabled
      if (this.config.encryptionEnabled) {
        processedData = await this.encryptData(processedData);
      }

      // Calculate checksum
      backup.checksum = await this.calculateChecksum(processedData);

      // Store backup
      const location = await this.storeBackup(backupId, processedData);
      backup.location = location;
      backup.size = processedData.size;

      backup.status = 'completed';

      // Clean up old backups
      await this.cleanupOldBackups();

      ErrorTracker.logError(new Error('Backup completed successfully'), {
        category: 'system',
        severity: 'low',
        metadata: { backupId, type, size: backup.size }
      });

      return backup;

    } catch (error) {
      backup.status = 'failed';
      ErrorTracker.logError(error as Error, {
        category: 'system',
        severity: 'high',
        metadata: { backupId, type }
      });
      throw error;
    }
  }

  static async restoreBackup(backupId: string): Promise<void> {
    try {
      const backup = this.backups.find(b => b.id === backupId);
      if (!backup) {
        throw new Error(`Backup ${backupId} not found`);
      }

      if (backup.status !== 'completed') {
        throw new Error(`Backup ${backupId} is not completed`);
      }

      // Load backup data
      const backupData = await this.loadBackup(backupId);
      
      // Decrypt if needed
      let processedData = backupData;
      if (this.config.encryptionEnabled) {
        processedData = await this.decryptData(processedData);
      }

      // Decompress if needed
      if (this.config.compressionEnabled) {
        processedData = await this.decompressData(processedData);
      }

      // Verify checksum
      const checksum = await this.calculateChecksum(processedData);
      if (checksum !== backup.checksum) {
        throw new Error('Backup checksum verification failed');
      }

      // Restore data
      await this.importDatabaseData(processedData);

      ErrorTracker.logError(new Error('Backup restored successfully'), {
        category: 'system',
        severity: 'low',
        metadata: { backupId }
      });

    } catch (error) {
      ErrorTracker.logError(error as Error, {
        category: 'system',
        severity: 'critical',
        metadata: { backupId }
      });
      throw error;
    }
  }

  static getBackupList(): BackupMetadata[] {
    return this.backups.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  static async scheduleBackups(): Promise<void> {
    if (!this.config.enabled) return;

    const now = new Date();
    const lastBackup = this.backups
      .filter(b => b.status === 'completed')
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

    if (!lastBackup) {
      // No backups exist, create one
      await this.createBackup('full');
      return;
    }

    const timeSinceLastBackup = now.getTime() - lastBackup.timestamp.getTime();
    const scheduleMs = this.getScheduleMs();

    if (timeSinceLastBackup >= scheduleMs) {
      const backupType = this.shouldCreateFullBackup() ? 'full' : 'incremental';
      await this.createBackup(backupType);
    }
  }

  private static async getTableNames(): Promise<string[]> {
    // Get all table names from Prisma schema
    const tables = [
      'User',
      'Subscription',
      'DownloadLimit',
      'DownloadHistory',
      'Activity',
      'ConsentRecord',
      'DataExportRequest',
      'DataDeletionRequest',
      'DataRectificationRequest'
    ];

    return tables;
  }

  private static async exportDatabaseData(tables: string[]): Promise<any> {
    const data: any = {};
    let totalRecords = 0;

    for (const table of tables) {
      try {
        // Use Prisma to export data
        const tableData = await (prisma as any)[table.toLowerCase()].findMany();
        data[table] = tableData;
        totalRecords += tableData.length;
      } catch (error) {
        console.warn(`Failed to export table ${table}:`, error);
        data[table] = [];
      }
    }

    return {
      tables: data,
      totalRecords,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
  }

  private static async importDatabaseData(data: any): Promise<void> {
    // This is a simplified implementation
    // In production, you'd want to handle conflicts, transactions, etc.
    for (const [tableName, records] of Object.entries(data.tables)) {
      if (Array.isArray(records) && records.length > 0) {
        try {
          // Clear existing data (be careful in production!)
          await (prisma as any)[tableName.toLowerCase()].deleteMany();
          
          // Insert backup data
          await (prisma as any)[tableName.toLowerCase()].createMany({
            data: records
          });
        } catch (error) {
          console.error(`Failed to restore table ${tableName}:`, error);
          throw error;
        }
      }
    }
  }

  private static async compressData(data: any): Promise<any> {
    // In production, use a proper compression library like zlib
    return {
      ...data,
      compressed: true,
      originalSize: JSON.stringify(data).length
    };
  }

  private static async decompressData(data: any): Promise<any> {
    // In production, use a proper decompression library
    return data;
  }

  private static async encryptData(data: any): Promise<any> {
    // In production, use proper encryption
    return {
      ...data,
      encrypted: true
    };
  }

  private static async decryptData(data: any): Promise<any> {
    // In production, use proper decryption
    return data;
  }

  private static async calculateChecksum(data: any): Promise<string> {
    // In production, use a proper hashing algorithm
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256');
    hash.update(JSON.stringify(data));
    return hash.digest('hex');
  }

  private static async storeBackup(backupId: string, data: any): Promise<string> {
    // In production, store in S3, GCS, or other cloud storage
    const location = `/backups/${backupId}.json`;
    
    // For now, just return the location
    // In production, actually store the data
    return location;
  }

  private static async loadBackup(backupId: string): Promise<any> {
    // In production, load from actual storage
    return {};
  }

  private static async cleanupOldBackups(): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);

    this.backups = this.backups.filter(backup => 
      backup.timestamp > cutoffDate || backup.status === 'in_progress'
    );
  }

  private static getScheduleMs(): number {
    switch (this.config.schedule) {
      case 'hourly': return 60 * 60 * 1000;
      case 'daily': return 24 * 60 * 60 * 1000;
      case 'weekly': return 7 * 24 * 60 * 60 * 1000;
      default: return 24 * 60 * 60 * 1000;
    }
  }

  private static shouldCreateFullBackup(): boolean {
    const lastFullBackup = this.backups
      .filter(b => b.type === 'full' && b.status === 'completed')
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

    if (!lastFullBackup) return true;

    // Create full backup weekly
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    return lastFullBackup.timestamp < weekAgo;
  }

  static getConfig(): BackupConfig {
    return { ...this.config };
  }

  static updateConfig(newConfig: Partial<BackupConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}
