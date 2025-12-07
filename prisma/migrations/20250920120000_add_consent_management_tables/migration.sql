-- CreateEnum
CREATE TYPE "ConsentType" AS ENUM ('DATA_PROCESSING', 'MARKETING_COMMUNICATIONS', 'ANALYTICS_TRACKING', 'THIRD_PARTY_SHARING', 'COOKIES_ESSENTIAL', 'COOKIES_ANALYTICS', 'COOKIES_FUNCTIONAL', 'COOKIES_MARKETING', 'DATA_EXPORT', 'DATA_DELETION', 'PROFILING', 'AUTOMATED_DECISION_MAKING');

-- CreateEnum
CREATE TYPE "LegalBasis" AS ENUM ('CONSENT', 'CONTRACT', 'LEGAL_OBLIGATION', 'VITAL_INTERESTS', 'PUBLIC_TASK', 'LEGITIMATE_INTERESTS');

-- CreateEnum
CREATE TYPE "ConsentMethod" AS ENUM ('EXPLICIT', 'IMPLICIT', 'OPT_IN', 'OPT_OUT', 'GRANULAR', 'BUNDLED');

-- CreateEnum
CREATE TYPE "ConsentAction" AS ENUM ('GRANTED', 'WITHDRAWN', 'UPDATED', 'EXPIRED', 'RENEWED', 'REVOKED');

-- CreateEnum
CREATE TYPE "RetentionAction" AS ENUM ('RETAIN', 'DELETE', 'ANONYMIZE', 'ARCHIVE', 'NOTIFY_EXPIRY');

-- CreateTable
CREATE TABLE "consent_records" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "consentType" "ConsentType" NOT NULL,
    "purpose" TEXT NOT NULL,
    "legalBasis" "LegalBasis" NOT NULL,
    "granted" BOOLEAN NOT NULL,
    "grantedAt" TIMESTAMP(3),
    "withdrawnAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "consentMethod" "ConsentMethod" NOT NULL DEFAULT 'EXPLICIT',
    "dataCategories" TEXT[],
    "thirdParties" TEXT[],
    "retentionPeriod" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consent_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consent_audit_logs" (
    "id" TEXT NOT NULL,
    "consentRecordId" TEXT NOT NULL,
    "action" "ConsentAction" NOT NULL,
    "previousValue" JSONB,
    "newValue" JSONB,
    "reason" TEXT,
    "performedBy" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consent_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_retention_policies" (
    "id" TEXT NOT NULL,
    "dataCategory" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "retentionPeriod" INTEGER NOT NULL,
    "legalBasis" "LegalBasis" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "data_retention_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_retention_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dataCategory" TEXT NOT NULL,
    "action" "RetentionAction" NOT NULL,
    "recordsAffected" INTEGER NOT NULL,
    "retentionPolicyId" TEXT,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "data_retention_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "consent_records_grantedAt_idx" ON "consent_records"("grantedAt");

-- CreateIndex
CREATE INDEX "consent_records_expiresAt_idx" ON "consent_records"("expiresAt");

-- CreateIndex
CREATE INDEX "consent_records_userId_consentType_idx" ON "consent_records"("userId", "consentType");

-- CreateIndex
CREATE INDEX "consent_audit_logs_consentRecordId_idx" ON "consent_audit_logs"("consentRecordId");

-- CreateIndex
CREATE INDEX "consent_audit_logs_createdAt_idx" ON "consent_audit_logs"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "data_retention_policies_dataCategory_key" ON "data_retention_policies"("dataCategory");

-- CreateIndex
CREATE INDEX "data_retention_logs_userId_dataCategory_idx" ON "data_retention_logs"("userId", "dataCategory");

-- CreateIndex
CREATE INDEX "data_retention_logs_processedAt_idx" ON "data_retention_logs"("processedAt");

-- AddForeignKey
ALTER TABLE "consent_records" ADD CONSTRAINT "consent_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consent_audit_logs" ADD CONSTRAINT "consent_audit_logs_consentRecordId_fkey" FOREIGN KEY ("consentRecordId") REFERENCES "consent_records"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
