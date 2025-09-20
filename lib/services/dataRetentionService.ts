import { LegalBasis, PrismaClient, RetentionAction } from '@prisma/client';

const prisma = new PrismaClient();

export interface DataRetentionPolicy {
  id: string;
  dataCategory: string;
  purpose: string;
  retentionPeriod: number; // Days
  legalBasis: LegalBasis;
  isActive: boolean;
}

export interface RetentionLog {
  id: string;
  userId: string;
  dataCategory: string;
  action: RetentionAction;
  recordsAffected: number;
  processedAt: Date;
}

export class DataRetentionService {
  /**
   * Initialize default data retention policies
   */
  static async initializePolicies(): Promise<void> {
    const defaultPolicies = [
      {
        dataCategory: 'personal_data',
        purpose: 'Prestação de serviços de fonoaudiologia',
        retentionPeriod: 730, // 2 years
        legalBasis: LegalBasis.CONTRACT
      },
      {
        dataCategory: 'contact_info',
        purpose: 'Comunicação com usuários',
        retentionPeriod: 365, // 1 year
        legalBasis: LegalBasis.CONSENT
      },
      {
        dataCategory: 'usage_data',
        purpose: 'Melhoria de serviços e analytics',
        retentionPeriod: 1095, // 3 years
        legalBasis: LegalBasis.LEGITIMATE_INTERESTS
      },
      {
        dataCategory: 'marketing_data',
        purpose: 'Comunicações de marketing',
        retentionPeriod: 365, // 1 year
        legalBasis: LegalBasis.CONSENT
      },
      {
        dataCategory: 'session_data',
        purpose: 'Funcionamento do site',
        retentionPeriod: 30, // 30 days
        legalBasis: LegalBasis.LEGITIMATE_INTERESTS
      },
      {
        dataCategory: 'analytics_data',
        purpose: 'Análise de uso e performance',
        retentionPeriod: 1095, // 3 years
        legalBasis: LegalBasis.LEGITIMATE_INTERESTS
      },
      {
        dataCategory: 'payment_data',
        purpose: 'Processamento de pagamentos',
        retentionPeriod: 2555, // 7 years (legal requirement)
        legalBasis: LegalBasis.LEGAL_OBLIGATION
      },
      {
        dataCategory: 'medical_records',
        purpose: 'Registros médicos de pacientes',
        retentionPeriod: 5475, // 15 years (medical records)
        legalBasis: LegalBasis.LEGAL_OBLIGATION
      }
    ];

    for (const policy of defaultPolicies) {
      await prisma.dataRetentionPolicy.upsert({
        where: { dataCategory: policy.dataCategory },
        update: policy,
        create: policy
      });
    }
  }

  /**
   * Process data retention for a specific user
   */
  static async processUserDataRetention(userId: string): Promise<RetentionLog[]> {
    const logs: RetentionLog[] = [];
    
    // Get all active retention policies
    const policies = await prisma.dataRetentionPolicy.findMany({
      where: { isActive: true }
    });

    for (const policy of policies) {
      const log = await this.processDataCategoryRetention(userId, policy);
      if (log) {
        logs.push(log);
      }
    }

    return logs;
  }

  /**
   * Process retention for a specific data category
   */
  private static async processDataCategoryRetention(
    userId: string, 
    policy: DataRetentionPolicy
  ): Promise<RetentionLog | null> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - policy.retentionPeriod);

    let recordsAffected = 0;
    let action: RetentionAction = RetentionAction.RETAIN;

    try {
      switch (policy.dataCategory) {
        case 'personal_data':
          // Delete old user data (but keep essential records)
          const oldUserData = await prisma.user.findFirst({
            where: {
              id: userId,
              updatedAt: { lt: cutoffDate }
            }
          });
          
          if (oldUserData) {
            // Only delete if user has been inactive for retention period
            const lastActivity = await this.getLastUserActivity(userId);
            if (lastActivity && lastActivity < cutoffDate) {
              // Archive user data instead of deleting
              action = RetentionAction.ARCHIVE;
              recordsAffected = 1;
            }
          }
          break;

        case 'usage_data':
          // Delete old download history
          const deletedDownloads = await prisma.downloadHistory.deleteMany({
            where: {
              userId,
              downloadedAt: { lt: cutoffDate }
            }
          });
          recordsAffected = deletedDownloads.count;
          action = deletedDownloads.count > 0 ? RetentionAction.DELETE : RetentionAction.RETAIN;
          break;

        case 'analytics_data':
          // Delete old consent audit logs
          const deletedAuditLogs = await prisma.consentAuditLog.deleteMany({
            where: {
              consentRecord: {
                userId
              },
              createdAt: { lt: cutoffDate }
            }
          });
          recordsAffected = deletedAuditLogs.count;
          action = deletedAuditLogs.count > 0 ? RetentionAction.DELETE : RetentionAction.RETAIN;
          break;

        case 'session_data':
          // This would typically be handled by session management
          // For now, we'll just log that it should be cleaned
          action = RetentionAction.DELETE;
          recordsAffected = 0; // Would need session storage implementation
          break;

        case 'marketing_data':
          // Delete old marketing consent records
          const deletedMarketingConsent = await prisma.consentRecord.deleteMany({
            where: {
              userId,
              consentType: 'MARKETING_COMMUNICATIONS',
              granted: false,
              withdrawnAt: { lt: cutoffDate }
            }
          });
          recordsAffected = deletedMarketingConsent.count;
          action = deletedMarketingConsent.count > 0 ? RetentionAction.DELETE : RetentionAction.RETAIN;
          break;

        default:
          // For other categories, just log that they should be reviewed
          action = RetentionAction.RETAIN;
          recordsAffected = 0;
      }

      // Create retention log
      const retentionLog = await prisma.dataRetentionLog.create({
        data: {
          userId,
          dataCategory: policy.dataCategory,
          action,
          recordsAffected,
          retentionPolicyId: policy.id
        }
      });

      return retentionLog as RetentionLog;

    } catch (error) {
      console.error(`Error processing retention for category ${policy.dataCategory}:`, error);
      return null;
    }
  }

  /**
   * Get the last activity date for a user
   */
  private static async getLastUserActivity(userId: string): Promise<Date | null> {
    const lastDownload = await prisma.downloadHistory.findFirst({
      where: { userId },
      orderBy: { downloadedAt: 'desc' },
      select: { downloadedAt: true }
    });

    const lastConsent = await prisma.consentRecord.findFirst({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: { updatedAt: true }
    });

    const lastUserUpdate = await prisma.user.findUnique({
      where: { id: userId },
      select: { updatedAt: true }
    });

    const dates = [
      lastDownload?.downloadedAt,
      lastConsent?.updatedAt,
      lastUserUpdate?.updatedAt
    ].filter(Boolean) as Date[];

    return dates.length > 0 ? new Date(Math.max(...dates.map(d => d.getTime()))) : null;
  }

  /**
   * Process retention for all users (batch job)
   */
  static async processAllUsersRetention(): Promise<RetentionLog[]> {
    const allLogs: RetentionLog[] = [];
    
    // Get all users
    const users = await prisma.user.findMany({
      select: { id: true }
    });

    for (const user of users) {
      const userLogs = await this.processUserDataRetention(user.id);
      allLogs.push(...userLogs);
    }

    return allLogs;
  }

  /**
   * Get expiring data notifications
   */
  static async getExpiringDataNotifications(daysBeforeExpiry: number = 30): Promise<any[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + daysBeforeExpiry);

    // Get users with expiring consent
    const expiringConsents = await prisma.consentRecord.findMany({
      where: {
        granted: true,
        expiresAt: {
          lte: cutoffDate,
          gte: new Date()
        }
      },
      include: {
        user: {
          select: {
            email: true,
            fullName: true
          }
        }
      }
    });

    return expiringConsents;
  }

  /**
   * Clean up expired consents
   */
  static async cleanupExpiredConsents(): Promise<number> {
    const result = await prisma.consentRecord.updateMany({
      where: {
        granted: true,
        expiresAt: {
          lt: new Date()
        }
      },
      data: {
        granted: false,
        withdrawnAt: new Date(),
        updatedAt: new Date()
      }
    });

    return result.count;
  }

  /**
   * Get retention statistics
   */
  static async getRetentionStatistics(): Promise<{
    totalPolicies: number;
    activePolicies: number;
    totalLogs: number;
    recentLogs: number;
  }> {
    const totalPolicies = await prisma.dataRetentionPolicy.count();
    const activePolicies = await prisma.dataRetentionPolicy.count({
      where: { isActive: true }
    });
    
    const totalLogs = await prisma.dataRetentionLog.count();
    const recentLogs = await prisma.dataRetentionLog.count({
      where: {
        processedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      }
    });

    return {
      totalPolicies,
      activePolicies,
      totalLogs,
      recentLogs
    };
  }

  /**
   * Create a new retention policy
   */
  static async createRetentionPolicy(data: {
    dataCategory: string;
    purpose: string;
    retentionPeriod: number;
    legalBasis: LegalBasis;
  }): Promise<DataRetentionPolicy> {
    return await prisma.dataRetentionPolicy.create({
      data: {
        ...data,
        isActive: true
      }
    });
  }

  /**
   * Update a retention policy
   */
  static async updateRetentionPolicy(
    id: string, 
    data: Partial<DataRetentionPolicy>
  ): Promise<DataRetentionPolicy> {
    return await prisma.dataRetentionPolicy.update({
      where: { id },
      data
    });
  }

  /**
   * Get all retention policies
   */
  static async getRetentionPolicies(): Promise<DataRetentionPolicy[]> {
    return await prisma.dataRetentionPolicy.findMany({
      orderBy: { dataCategory: 'asc' }
    });
  }
}

export default DataRetentionService;
