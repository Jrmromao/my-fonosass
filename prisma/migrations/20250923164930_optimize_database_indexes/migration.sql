-- CreateIndex
CREATE INDEX "Activity_isPublic_createdAt_idx" ON "public"."Activity"("isPublic", "createdAt");

-- CreateIndex
CREATE INDEX "Activity_type_difficulty_idx" ON "public"."Activity"("type", "difficulty");

-- CreateIndex
CREATE INDEX "Activity_ageRange_idx" ON "public"."Activity"("ageRange");

-- CreateIndex
CREATE INDEX "Activity_createdById_idx" ON "public"."Activity"("createdById");

-- CreateIndex
CREATE INDEX "Activity_name_idx" ON "public"."Activity"("name");

-- CreateIndex
CREATE INDEX "ActivityFile_activityId_idx" ON "public"."ActivityFile"("activityId");

-- CreateIndex
CREATE INDEX "ActivityFile_fileType_idx" ON "public"."ActivityFile"("fileType");

-- CreateIndex
CREATE INDEX "ActivityFile_uploadedById_idx" ON "public"."ActivityFile"("uploadedById");

-- CreateIndex
CREATE INDEX "Subscription_status_currentPeriodEnd_idx" ON "public"."Subscription"("status", "currentPeriodEnd");

-- CreateIndex
CREATE INDEX "Subscription_tier_idx" ON "public"."Subscription"("tier");

-- CreateIndex
CREATE INDEX "Subscription_createdAt_idx" ON "public"."Subscription"("createdAt");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "public"."User"("createdAt");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "public"."User"("role");
