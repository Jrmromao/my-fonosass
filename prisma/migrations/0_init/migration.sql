-- Baseline: the full schema, squashed on 2026-11-19 from the 29 migrations
-- 20241125214551_imit_db .. 20261120_activity_archive (see git history).
-- Those could not run on an empty database (20241223175000 altered
-- "resources" before 20250928084428 created it), so no new environment
-- could be built from them.
--
-- Generated with:
--   prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script
-- Databases created before the squash (production) already have this
-- schema; scripts/vercel-migrate.mjs records 0_init as applied there
-- instead of running it.

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "public"."ActivityStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'REJECTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."ActivityType" AS ENUM ('ANIMALS', 'COLOURS', 'MEANS_OF_TRANSPORT', 'CLOTHING', 'LANGUAGE', 'PROFESSIONS', 'GEOMETRIC_SHAPES', 'NUMBERS_AND_LETTERS', 'ALPHABET', 'MOTOR_SKILLS', 'HUMAN_BODY', 'OTHER', 'SPEECH', 'COGNITIVE', 'MOTOR', 'SOCIAL');

-- CreateEnum
CREATE TYPE "public"."TierType" AS ENUM ('FREE', 'PRO');

-- CreateEnum
CREATE TYPE "public"."SubStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PAST_DUE');

-- CreateEnum
CREATE TYPE "public"."ConsentType" AS ENUM ('DATA_PROCESSING', 'MARKETING_COMMUNICATIONS', 'ANALYTICS_TRACKING', 'THIRD_PARTY_SHARING', 'COOKIES_ESSENTIAL', 'COOKIES_ANALYTICS', 'COOKIES_FUNCTIONAL', 'COOKIES_MARKETING', 'DATA_EXPORT', 'DATA_DELETION', 'PROFILING', 'AUTOMATED_DECISION_MAKING');

-- CreateEnum
CREATE TYPE "public"."LegalBasis" AS ENUM ('CONSENT', 'CONTRACT', 'LEGAL_OBLIGATION', 'VITAL_INTERESTS', 'PUBLIC_TASK', 'LEGITIMATE_INTERESTS');

-- CreateEnum
CREATE TYPE "public"."ConsentMethod" AS ENUM ('EXPLICIT', 'IMPLICIT', 'OPT_IN', 'OPT_OUT', 'GRANULAR', 'BUNDLED');

-- CreateEnum
CREATE TYPE "public"."ConsentAction" AS ENUM ('GRANTED', 'WITHDRAWN', 'UPDATED', 'EXPIRED', 'RENEWED', 'REVOKED');

-- CreateEnum
CREATE TYPE "public"."RetentionAction" AS ENUM ('RETAIN', 'DELETE', 'ANONYMIZE', 'ARCHIVE', 'NOTIFY_EXPIRY');

-- CreateEnum
CREATE TYPE "public"."ResourceType" AS ENUM ('PDF', 'VIDEO', 'AUDIO', 'GUIDE', 'DOCUMENT', 'PRESENTATION', 'WORKSHEET', 'IMAGE', 'INTERACTIVE');

-- CreateEnum
CREATE TYPE "public"."DataCorrectionRequestStatus" AS ENUM ('PENDING', 'RESOLVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."DataExportFormat" AS ENUM ('JSON');

-- CreateEnum
CREATE TYPE "public"."DataExportRequestStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."AuditActorType" AS ENUM ('ADMIN', 'USER', 'MACHINE', 'ANONYMOUS');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" "public"."UserRole" NOT NULL DEFAULT 'USER',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Activity" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "type" "public"."ActivityType" NOT NULL,
    "phoneme" TEXT NOT NULL DEFAULT '',
    "status" "public"."ActivityStatus" NOT NULL DEFAULT 'DRAFT',
    "approvalToken" TEXT,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewFeedback" TEXT,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ActivityFile" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "s3Key" TEXT NOT NULL,
    "archivedFromKey" TEXT,
    "s3Url" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "sizeInBytes" INTEGER NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActivityFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ActivityCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActivityCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tier" "public"."TierType" NOT NULL DEFAULT 'FREE',
    "status" "public"."SubStatus" NOT NULL DEFAULT 'INACTIVE',
    "currentPeriodStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currentPeriodEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "paymentId" TEXT,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."download_history" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER,
    "downloadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "download_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."downloads" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "downloadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "downloads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."download_limits" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "resetDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "download_limits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."consent_records" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "consentType" "public"."ConsentType" NOT NULL,
    "purpose" TEXT NOT NULL,
    "legalBasis" "public"."LegalBasis" NOT NULL,
    "granted" BOOLEAN NOT NULL,
    "grantedAt" TIMESTAMP(3),
    "withdrawnAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "consentMethod" "public"."ConsentMethod" NOT NULL DEFAULT 'EXPLICIT',
    "dataCategories" TEXT[],
    "thirdParties" TEXT[],
    "retentionPeriod" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consent_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."consent_audit_logs" (
    "id" TEXT NOT NULL,
    "consentRecordId" TEXT NOT NULL,
    "action" "public"."ConsentAction" NOT NULL,
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
CREATE TABLE "public"."data_retention_policies" (
    "id" TEXT NOT NULL,
    "dataCategory" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "retentionPeriod" INTEGER NOT NULL,
    "legalBasis" "public"."LegalBasis" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "data_retention_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."data_retention_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dataCategory" TEXT NOT NULL,
    "action" "public"."RetentionAction" NOT NULL,
    "recordsAffected" INTEGER NOT NULL,
    "retentionPolicyId" TEXT,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "data_retention_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."blog_posts" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "likeCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "blog_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."blog_views" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "referer" TEXT,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blog_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."blog_likes" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "likedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blog_likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."resources" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT,
    "description" TEXT NOT NULL,
    "content" TEXT DEFAULT '',
    "type" "public"."ResourceType" NOT NULL,
    "category" TEXT NOT NULL,
    "ageGroup" TEXT NOT NULL,
    "duration" TEXT,
    "fileSize" TEXT,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "tags" TEXT[],
    "downloadUrl" TEXT NOT NULL,
    "viewUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "isFree" BOOLEAN NOT NULL DEFAULT true,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."resource_files" (
    "id" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "s3Key" TEXT NOT NULL,
    "s3Url" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "sizeInBytes" INTEGER NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resource_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."resource_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "icon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resource_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."resource_downloads" (
    "id" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "userId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "downloadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resource_downloads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."resource_views" (
    "id" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "userId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resource_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."resource_ratings" (
    "id" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "userId" TEXT,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resource_ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_ResourceToCategory" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ResourceToCategory_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."activity_download_stats" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "month" TIMESTAMP(3) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "activity_download_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."account_deletions" (
    "id" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hadSubscription" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "account_deletions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."data_export_requests" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "format" "public"."DataExportFormat" NOT NULL DEFAULT 'JSON',
    "reason" TEXT,
    "status" "public"."DataExportRequestStatus" NOT NULL DEFAULT 'PENDING',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,

    CONSTRAINT "data_export_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."data_correction_requests" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "public"."DataCorrectionRequestStatus" NOT NULL DEFAULT 'PENDING',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "resolutionNote" TEXT,
    "resolvedById" TEXT,

    CONSTRAINT "data_correction_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."processed_webhook_events" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "processed_webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."library_topic_contents" (
    "slug" TEXT NOT NULL,
    "about" TEXT NOT NULL,
    "updatedById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "library_topic_contents_pkey" PRIMARY KEY ("slug")
);

-- CreateTable
CREATE TABLE "public"."audit_events" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actorType" "public"."AuditActorType" NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "targetType" TEXT,
    "targetId" TEXT,
    "ip" TEXT,
    "metadata" JSONB,

    CONSTRAINT "audit_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."free_sample_selections" (
    "id" TEXT NOT NULL,
    "month" TIMESTAMP(3) NOT NULL,
    "position" INTEGER NOT NULL,
    "activityId" TEXT NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "free_sample_selections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_ActivityToActivityCategory" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ActivityToActivityCategory_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkUserId_key" ON "public"."User"("clerkUserId");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "public"."User"("createdAt");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "public"."User"("role");

-- CreateIndex
CREATE INDEX "Activity_isPublic_createdAt_idx" ON "public"."Activity"("isPublic", "createdAt");

-- CreateIndex
CREATE INDEX "Activity_type_idx" ON "public"."Activity"("type");

-- CreateIndex
CREATE INDEX "Activity_createdById_idx" ON "public"."Activity"("createdById");

-- CreateIndex
CREATE INDEX "Activity_name_idx" ON "public"."Activity"("name");

-- CreateIndex
CREATE INDEX "Activity_status_idx" ON "public"."Activity"("status");

-- CreateIndex
CREATE INDEX "Activity_reviewedById_idx" ON "public"."Activity"("reviewedById");

-- CreateIndex
CREATE INDEX "ActivityFile_activityId_idx" ON "public"."ActivityFile"("activityId");

-- CreateIndex
CREATE INDEX "ActivityFile_fileType_idx" ON "public"."ActivityFile"("fileType");

-- CreateIndex
CREATE INDEX "ActivityFile_uploadedById_idx" ON "public"."ActivityFile"("uploadedById");

-- CreateIndex
CREATE UNIQUE INDEX "ActivityCategory_name_key" ON "public"."ActivityCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_key" ON "public"."Subscription"("userId");

-- CreateIndex
CREATE INDEX "Subscription_status_currentPeriodEnd_idx" ON "public"."Subscription"("status", "currentPeriodEnd");

-- CreateIndex
CREATE INDEX "Subscription_tier_idx" ON "public"."Subscription"("tier");

-- CreateIndex
CREATE INDEX "Subscription_createdAt_idx" ON "public"."Subscription"("createdAt");

-- CreateIndex
CREATE INDEX "download_history_userId_downloadedAt_idx" ON "public"."download_history"("userId", "downloadedAt");

-- CreateIndex
CREATE INDEX "download_history_activityId_idx" ON "public"."download_history"("activityId");

-- CreateIndex
CREATE INDEX "downloads_userId_downloadedAt_idx" ON "public"."downloads"("userId", "downloadedAt");

-- CreateIndex
CREATE INDEX "downloads_exerciseId_idx" ON "public"."downloads"("exerciseId");

-- CreateIndex
CREATE UNIQUE INDEX "download_limits_userId_key" ON "public"."download_limits"("userId");

-- CreateIndex
CREATE INDEX "consent_records_grantedAt_idx" ON "public"."consent_records"("grantedAt");

-- CreateIndex
CREATE INDEX "consent_records_expiresAt_idx" ON "public"."consent_records"("expiresAt");

-- CreateIndex
CREATE INDEX "consent_records_userId_consentType_idx" ON "public"."consent_records"("userId", "consentType");

-- CreateIndex
CREATE INDEX "consent_audit_logs_consentRecordId_idx" ON "public"."consent_audit_logs"("consentRecordId");

-- CreateIndex
CREATE INDEX "consent_audit_logs_createdAt_idx" ON "public"."consent_audit_logs"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "data_retention_policies_dataCategory_key" ON "public"."data_retention_policies"("dataCategory");

-- CreateIndex
CREATE INDEX "data_retention_logs_userId_dataCategory_idx" ON "public"."data_retention_logs"("userId", "dataCategory");

-- CreateIndex
CREATE INDEX "data_retention_logs_processedAt_idx" ON "public"."data_retention_logs"("processedAt");

-- CreateIndex
CREATE UNIQUE INDEX "blog_posts_slug_key" ON "public"."blog_posts"("slug");

-- CreateIndex
CREATE INDEX "blog_views_postId_idx" ON "public"."blog_views"("postId");

-- CreateIndex
CREATE INDEX "blog_views_viewedAt_idx" ON "public"."blog_views"("viewedAt");

-- CreateIndex
CREATE INDEX "blog_likes_postId_idx" ON "public"."blog_likes"("postId");

-- CreateIndex
CREATE INDEX "blog_likes_likedAt_idx" ON "public"."blog_likes"("likedAt");

-- CreateIndex
CREATE UNIQUE INDEX "blog_likes_postId_ipAddress_key" ON "public"."blog_likes"("postId", "ipAddress");

-- CreateIndex
CREATE UNIQUE INDEX "resources_slug_key" ON "public"."resources"("slug");

-- CreateIndex
CREATE INDEX "resources_isPublished_createdAt_idx" ON "public"."resources"("isPublished", "createdAt");

-- CreateIndex
CREATE INDEX "resources_type_category_idx" ON "public"."resources"("type", "category");

-- CreateIndex
CREATE INDEX "resources_isFree_isFeatured_idx" ON "public"."resources"("isFree", "isFeatured");

-- CreateIndex
CREATE INDEX "resources_createdById_idx" ON "public"."resources"("createdById");

-- CreateIndex
CREATE INDEX "resources_title_idx" ON "public"."resources"("title");

-- CreateIndex
CREATE INDEX "resource_files_resourceId_idx" ON "public"."resource_files"("resourceId");

-- CreateIndex
CREATE INDEX "resource_files_fileType_idx" ON "public"."resource_files"("fileType");

-- CreateIndex
CREATE INDEX "resource_files_uploadedById_idx" ON "public"."resource_files"("uploadedById");

-- CreateIndex
CREATE UNIQUE INDEX "resource_categories_name_key" ON "public"."resource_categories"("name");

-- CreateIndex
CREATE INDEX "resource_downloads_resourceId_idx" ON "public"."resource_downloads"("resourceId");

-- CreateIndex
CREATE INDEX "resource_downloads_userId_downloadedAt_idx" ON "public"."resource_downloads"("userId", "downloadedAt");

-- CreateIndex
CREATE INDEX "resource_downloads_downloadedAt_idx" ON "public"."resource_downloads"("downloadedAt");

-- CreateIndex
CREATE INDEX "resource_views_resourceId_idx" ON "public"."resource_views"("resourceId");

-- CreateIndex
CREATE INDEX "resource_views_userId_viewedAt_idx" ON "public"."resource_views"("userId", "viewedAt");

-- CreateIndex
CREATE INDEX "resource_views_viewedAt_idx" ON "public"."resource_views"("viewedAt");

-- CreateIndex
CREATE INDEX "resource_ratings_resourceId_idx" ON "public"."resource_ratings"("resourceId");

-- CreateIndex
CREATE INDEX "resource_ratings_userId_idx" ON "public"."resource_ratings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "resource_ratings_resourceId_userId_key" ON "public"."resource_ratings"("resourceId", "userId");

-- CreateIndex
CREATE INDEX "_ResourceToCategory_B_index" ON "public"."_ResourceToCategory"("B");

-- CreateIndex
CREATE INDEX "activity_download_stats_month_idx" ON "public"."activity_download_stats"("month");

-- CreateIndex
CREATE UNIQUE INDEX "activity_download_stats_activityId_month_key" ON "public"."activity_download_stats"("activityId", "month");

-- CreateIndex
CREATE INDEX "account_deletions_deletedAt_idx" ON "public"."account_deletions"("deletedAt");

-- CreateIndex
CREATE INDEX "data_export_requests_userId_requestedAt_idx" ON "public"."data_export_requests"("userId", "requestedAt");

-- CreateIndex
CREATE INDEX "data_correction_requests_userId_requestedAt_idx" ON "public"."data_correction_requests"("userId", "requestedAt");

-- CreateIndex
CREATE INDEX "data_correction_requests_status_requestedAt_idx" ON "public"."data_correction_requests"("status", "requestedAt");

-- CreateIndex
CREATE INDEX "processed_webhook_events_processedAt_idx" ON "public"."processed_webhook_events"("processedAt");

-- CreateIndex
CREATE INDEX "audit_events_createdAt_idx" ON "public"."audit_events"("createdAt");

-- CreateIndex
CREATE INDEX "audit_events_actorId_createdAt_idx" ON "public"."audit_events"("actorId", "createdAt");

-- CreateIndex
CREATE INDEX "audit_events_action_createdAt_idx" ON "public"."audit_events"("action", "createdAt");

-- CreateIndex
CREATE INDEX "audit_events_targetType_targetId_idx" ON "public"."audit_events"("targetType", "targetId");

-- CreateIndex
CREATE UNIQUE INDEX "free_sample_selections_month_position_key" ON "public"."free_sample_selections"("month", "position");

-- CreateIndex
CREATE UNIQUE INDEX "free_sample_selections_month_activityId_key" ON "public"."free_sample_selections"("month", "activityId");

-- CreateIndex
CREATE INDEX "_ActivityToActivityCategory_B_index" ON "public"."_ActivityToActivityCategory"("B");

-- AddForeignKey
ALTER TABLE "public"."Activity" ADD CONSTRAINT "Activity_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Activity" ADD CONSTRAINT "Activity_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ActivityFile" ADD CONSTRAINT "ActivityFile_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "public"."Activity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."download_history" ADD CONSTRAINT "download_history_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "public"."Activity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."download_history" ADD CONSTRAINT "download_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."downloads" ADD CONSTRAINT "downloads_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."consent_records" ADD CONSTRAINT "consent_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."consent_audit_logs" ADD CONSTRAINT "consent_audit_logs_consentRecordId_fkey" FOREIGN KEY ("consentRecordId") REFERENCES "public"."consent_records"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."blog_views" ADD CONSTRAINT "blog_views_postId_fkey" FOREIGN KEY ("postId") REFERENCES "public"."blog_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."blog_likes" ADD CONSTRAINT "blog_likes_postId_fkey" FOREIGN KEY ("postId") REFERENCES "public"."blog_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."resources" ADD CONSTRAINT "resources_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."resource_files" ADD CONSTRAINT "resource_files_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "public"."resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."resource_downloads" ADD CONSTRAINT "resource_downloads_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "public"."resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."resource_downloads" ADD CONSTRAINT "resource_downloads_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."resource_views" ADD CONSTRAINT "resource_views_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "public"."resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."resource_views" ADD CONSTRAINT "resource_views_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."resource_ratings" ADD CONSTRAINT "resource_ratings_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "public"."resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."resource_ratings" ADD CONSTRAINT "resource_ratings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ResourceToCategory" ADD CONSTRAINT "_ResourceToCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ResourceToCategory" ADD CONSTRAINT "_ResourceToCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."resource_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."activity_download_stats" ADD CONSTRAINT "activity_download_stats_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "public"."Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."data_export_requests" ADD CONSTRAINT "data_export_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."data_correction_requests" ADD CONSTRAINT "data_correction_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."free_sample_selections" ADD CONSTRAINT "free_sample_selections_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "public"."Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ActivityToActivityCategory" ADD CONSTRAINT "_ActivityToActivityCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ActivityToActivityCategory" ADD CONSTRAINT "_ActivityToActivityCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."ActivityCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Row Level Security on every table, as in production. No policies: the
-- Supabase API (anon/authenticated roles) gets no access; the app connects
-- through Prisma as the table owner, which RLS does not restrict.
DO $$
DECLARE t record;
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t.tablename);
  END LOOP;
END $$;
