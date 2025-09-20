import { ConsentAction, ConsentMethod, ConsentType, LegalBasis, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ConsentPreferences {
  dataProcessing: boolean;
  marketingCommunications: boolean;
  analyticsTracking: boolean;
  thirdPartySharing: boolean;
  cookiesEssential: boolean;
  cookiesAnalytics: boolean;
  cookiesFunctional: boolean;
  cookiesMarketing: boolean;
  profiling: boolean;
  automatedDecisionMaking: boolean;
}

export interface ConsentRequest {
  userId: string;
  preferences: ConsentPreferences;
  ipAddress?: string;
  userAgent?: string;
  consentMethod?: ConsentMethod;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: ConsentType;
  purpose: string;
  legalBasis: LegalBasis;
  granted: boolean;
  grantedAt: Date | null;
  withdrawnAt: Date | null;
  expiresAt: Date | null;
  dataCategories: string[];
  thirdParties: string[];
  retentionPeriod: number | null;
}

export class ConsentService {
  /**
   * Record granular consent preferences for a user
   */
  static async recordConsent(request: ConsentRequest): Promise<ConsentRecord[]> {
    const { userId, preferences, ipAddress, userAgent, consentMethod = ConsentMethod.GRANULAR } = request;
    
    const consentRecords: ConsentRecord[] = [];
    
    // Define consent mappings
    const consentMappings = [
      {
        type: ConsentType.DATA_PROCESSING,
        preference: preferences.dataProcessing,
        purpose: 'Processamento de dados pessoais para prestação de serviços',
        legalBasis: LegalBasis.CONSENT,
        dataCategories: ['personal_data', 'contact_info', 'usage_data'],
        thirdParties: [],
        retentionPeriod: 730 // 2 years
      },
      {
        type: ConsentType.MARKETING_COMMUNICATIONS,
        preference: preferences.marketingCommunications,
        purpose: 'Envio de comunicações de marketing e newsletters',
        legalBasis: LegalBasis.CONSENT,
        dataCategories: ['contact_info', 'preferences'],
        thirdParties: ['email_service_provider'],
        retentionPeriod: 365 // 1 year
      },
      {
        type: ConsentType.ANALYTICS_TRACKING,
        preference: preferences.analyticsTracking,
        purpose: 'Coleta de dados analíticos para melhoria do serviço',
        legalBasis: LegalBasis.LEGITIMATE_INTERESTS,
        dataCategories: ['usage_data', 'device_info'],
        thirdParties: ['google_analytics'],
        retentionPeriod: 1095 // 3 years
      },
      {
        type: ConsentType.THIRD_PARTY_SHARING,
        preference: preferences.thirdPartySharing,
        purpose: 'Compartilhamento de dados com terceiros para prestação de serviços',
        legalBasis: LegalBasis.CONSENT,
        dataCategories: ['personal_data', 'usage_data'],
        thirdParties: ['stripe', 'aws', 'clerk'],
        retentionPeriod: 730 // 2 years
      },
      {
        type: ConsentType.COOKIES_ESSENTIAL,
        preference: preferences.cookiesEssential,
        purpose: 'Cookies essenciais para funcionamento do site',
        legalBasis: LegalBasis.LEGITIMATE_INTERESTS,
        dataCategories: ['session_data'],
        thirdParties: [],
        retentionPeriod: 30 // 30 days
      },
      {
        type: ConsentType.COOKIES_ANALYTICS,
        preference: preferences.cookiesAnalytics,
        purpose: 'Cookies analíticos para coleta de métricas',
        legalBasis: LegalBasis.CONSENT,
        dataCategories: ['usage_data', 'device_info'],
        thirdParties: ['google_analytics'],
        retentionPeriod: 730 // 2 years
      },
      {
        type: ConsentType.COOKIES_FUNCTIONAL,
        preference: preferences.cookiesFunctional,
        purpose: 'Cookies funcionais para personalização',
        legalBasis: LegalBasis.CONSENT,
        dataCategories: ['preferences', 'settings'],
        thirdParties: [],
        retentionPeriod: 365 // 1 year
      },
      {
        type: ConsentType.COOKIES_MARKETING,
        preference: preferences.cookiesMarketing,
        purpose: 'Cookies de marketing para publicidade direcionada',
        legalBasis: LegalBasis.CONSENT,
        dataCategories: ['preferences', 'behavioral_data'],
        thirdParties: ['google_ads', 'facebook_pixel'],
        retentionPeriod: 365 // 1 year
      },
      {
        type: ConsentType.PROFILING,
        preference: preferences.profiling,
        purpose: 'Criação de perfis de usuário para personalização',
        legalBasis: LegalBasis.CONSENT,
        dataCategories: ['behavioral_data', 'preferences', 'usage_patterns'],
        thirdParties: [],
        retentionPeriod: 1095 // 3 years
      },
      {
        type: ConsentType.AUTOMATED_DECISION_MAKING,
        preference: preferences.automatedDecisionMaking,
        purpose: 'Tomada de decisões automatizadas baseadas em dados',
        legalBasis: LegalBasis.CONSENT,
        dataCategories: ['behavioral_data', 'usage_data', 'preferences'],
        thirdParties: [],
        retentionPeriod: 1095 // 3 years
      }
    ];

    // Process each consent type
    for (const mapping of consentMappings) {
      const existingRecord = await prisma.consentRecord.findFirst({
        where: {
          userId,
          consentType: mapping.type
        }
      });

      const consentRecord = existingRecord 
        ? await prisma.consentRecord.update({
            where: { id: existingRecord.id },
            data: {
              granted: mapping.preference,
              grantedAt: mapping.preference ? new Date() : null,
              withdrawnAt: !mapping.preference ? new Date() : null,
              expiresAt: mapping.preference ? new Date(Date.now() + mapping.retentionPeriod * 24 * 60 * 60 * 1000) : null,
              ipAddress,
              userAgent,
              consentMethod,
              dataCategories: mapping.dataCategories,
              thirdParties: mapping.thirdParties,
              retentionPeriod: mapping.retentionPeriod,
              updatedAt: new Date()
            }
          })
        : await prisma.consentRecord.create({
            data: {
              userId,
              consentType: mapping.type,
              purpose: mapping.purpose,
              legalBasis: mapping.legalBasis,
              granted: mapping.preference,
              grantedAt: mapping.preference ? new Date() : null,
              withdrawnAt: !mapping.preference ? new Date() : null,
              expiresAt: mapping.preference ? new Date(Date.now() + mapping.retentionPeriod * 24 * 60 * 60 * 1000) : null,
              ipAddress,
              userAgent,
              consentMethod,
              dataCategories: mapping.dataCategories,
              thirdParties: mapping.thirdParties,
              retentionPeriod: mapping.retentionPeriod
            }
          });

      // Create audit log
      await this.createAuditLog({
        consentRecordId: consentRecord.id,
        action: mapping.preference ? ConsentAction.GRANTED : ConsentAction.WITHDRAWN,
        newValue: {
          granted: mapping.preference,
          grantedAt: mapping.preference ? new Date() : null,
          withdrawnAt: !mapping.preference ? new Date() : null
        },
        reason: 'User consent preference updated',
        performedBy: userId,
        ipAddress,
        userAgent
      });

      consentRecords.push(consentRecord as ConsentRecord);
    }

    return consentRecords;
  }

  /**
   * Get user's current consent status
   */
  static async getUserConsentStatus(userId: string): Promise<ConsentRecord[]> {
    return await prisma.consentRecord.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Withdraw specific consent
   */
  static async withdrawConsent(
    userId: string, 
    consentType: ConsentType, 
    reason?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<ConsentRecord | null> {
    const consentRecord = await prisma.consentRecord.findFirst({
      where: {
        userId,
        consentType,
        granted: true
      }
    });

    if (!consentRecord) {
      return null;
    }

    const updatedRecord = await prisma.consentRecord.update({
      where: { id: consentRecord.id },
      data: {
        granted: false,
        withdrawnAt: new Date(),
        expiresAt: null,
        updatedAt: new Date()
      }
    });

    // Create audit log
    await this.createAuditLog({
      consentRecordId: consentRecord.id,
      action: ConsentAction.WITHDRAWN,
      previousValue: {
        granted: true,
        grantedAt: consentRecord.grantedAt,
        withdrawnAt: null
      },
      newValue: {
        granted: false,
        grantedAt: consentRecord.grantedAt,
        withdrawnAt: new Date()
      },
      reason: reason || 'User withdrew consent',
      performedBy: userId,
      ipAddress,
      userAgent
    });

    return updatedRecord as ConsentRecord;
  }

  /**
   * Get consent audit trail for a user
   */
  static async getConsentAuditTrail(userId: string): Promise<any[]> {
    return await prisma.consentAuditLog.findMany({
      where: {
        consentRecord: {
          userId
        }
      },
      include: {
        consentRecord: {
          select: {
            consentType: true,
            purpose: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Check if user has granted specific consent
   */
  static async hasConsent(userId: string, consentType: ConsentType): Promise<boolean> {
    const consent = await prisma.consentRecord.findFirst({
      where: {
        userId,
        consentType,
        granted: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      }
    });

    return !!consent;
  }

  /**
   * Create audit log entry
   */
  private static async createAuditLog(data: {
    consentRecordId: string;
    action: ConsentAction;
    previousValue?: any;
    newValue?: any;
    reason?: string;
    performedBy?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    await prisma.consentAuditLog.create({
      data: {
        consentRecordId: data.consentRecordId,
        action: data.action,
        previousValue: data.previousValue,
        newValue: data.newValue,
        reason: data.reason,
        performedBy: data.performedBy,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent
      }
    });
  }

  /**
   * Get expiring consents (for renewal notifications)
   */
  static async getExpiringConsents(daysBeforeExpiry: number = 30): Promise<ConsentRecord[]> {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + daysBeforeExpiry);

    return await prisma.consentRecord.findMany({
      where: {
        granted: true,
        expiresAt: {
          lte: expiryDate,
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
}

export default ConsentService;
