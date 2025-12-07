#!/usr/bin/env node

/**
 * Initialize Enhanced Consent Management System
 * 
 * This script:
 * 1. Runs database migration for consent tables
 * 2. Initializes default data retention policies
 * 3. Creates sample consent records for existing users
 */

const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function main() {
  console.log('🚀 Initializing Enhanced Consent Management System...\n');

  try {
    // Step 1: Run database migration
    console.log('📊 Running database migration...');
    execSync('npx prisma db push', { stdio: 'inherit' });
    console.log('✅ Database migration completed\n');

    // Step 2: Initialize data retention policies
    console.log('📋 Initializing data retention policies...');
    
    const defaultPolicies = [
      {
        dataCategory: 'personal_data',
        purpose: 'Prestação de serviços de fonoaudiologia',
        retentionPeriod: 730, // 2 years
        legalBasis: 'CONTRACT'
      },
      {
        dataCategory: 'contact_info',
        purpose: 'Comunicação com usuários',
        retentionPeriod: 365, // 1 year
        legalBasis: 'CONSENT'
      },
      {
        dataCategory: 'usage_data',
        purpose: 'Melhoria de serviços e analytics',
        retentionPeriod: 1095, // 3 years
        legalBasis: 'LEGITIMATE_INTERESTS'
      },
      {
        dataCategory: 'marketing_data',
        purpose: 'Comunicações de marketing',
        retentionPeriod: 365, // 1 year
        legalBasis: 'CONSENT'
      },
      {
        dataCategory: 'session_data',
        purpose: 'Funcionamento do site',
        retentionPeriod: 30, // 30 days
        legalBasis: 'LEGITIMATE_INTERESTS'
      },
      {
        dataCategory: 'analytics_data',
        purpose: 'Análise de uso e performance',
        retentionPeriod: 1095, // 3 years
        legalBasis: 'LEGITIMATE_INTERESTS'
      },
      {
        dataCategory: 'payment_data',
        purpose: 'Processamento de pagamentos',
        retentionPeriod: 2555, // 7 years (legal requirement)
        legalBasis: 'LEGAL_OBLIGATION'
      },
      {
        dataCategory: 'medical_records',
        purpose: 'Registros médicos de pacientes',
        retentionPeriod: 5475, // 15 years (medical records)
        legalBasis: 'LEGAL_OBLIGATION'
      }
    ];

    for (const policy of defaultPolicies) {
      await prisma.dataRetentionPolicy.upsert({
        where: { dataCategory: policy.dataCategory },
        update: policy,
        create: policy
      });
    }
    
    console.log('✅ Data retention policies initialized\n');

    // Step 3: Create default consent records for existing users
    console.log('👥 Creating default consent records for existing users...');
    
    const users = await prisma.user.findMany({
      select: { id: true, email: true, fullName: true }
    });

    console.log(`Found ${users.length} existing users`);

    for (const user of users) {
      // Create essential consent records (required for service)
      const essentialConsents = [
        {
          userId: user.id,
          consentType: 'DATA_PROCESSING',
          purpose: 'Processamento de dados pessoais para prestação de serviços',
          legalBasis: 'CONSENT',
          granted: true,
          grantedAt: new Date(),
          dataCategories: ['personal_data', 'contact_info', 'usage_data'],
          thirdParties: [],
          retentionPeriod: 730
        },
        {
          userId: user.id,
          consentType: 'COOKIES_ESSENTIAL',
          purpose: 'Cookies essenciais para funcionamento do site',
          legalBasis: 'LEGITIMATE_INTERESTS',
          granted: true,
          grantedAt: new Date(),
          dataCategories: ['session_data'],
          thirdParties: [],
          retentionPeriod: 30
        }
      ];

      for (const consent of essentialConsents) {
        await prisma.consentRecord.upsert({
          where: {
            userId_consentType: {
              userId: user.id,
              consentType: consent.consentType
            }
          },
          update: consent,
          create: consent
        });
      }

      console.log(`✅ Created essential consents for user: ${user.email}`);
    }

    console.log('✅ Default consent records created\n');

    // Step 4: Generate Prisma client
    console.log('🔧 Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✅ Prisma client generated\n');

    console.log('🎉 Enhanced Consent Management System initialized successfully!');
    console.log('\nNext steps:');
    console.log('1. Update your components to use EnhancedConsentManager');
    console.log('2. Add consent dashboard to your navigation');
    console.log('3. Test the consent management functionality');
    console.log('4. Configure automated data retention cleanup');

  } catch (error) {
    console.error('❌ Error initializing consent system:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
