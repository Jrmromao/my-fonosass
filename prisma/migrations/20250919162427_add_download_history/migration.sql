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

-- CreateIndex
CREATE INDEX "download_history_userId_downloadedAt_idx" ON "public"."download_history"("userId", "downloadedAt");

-- CreateIndex
CREATE INDEX "download_history_activityId_idx" ON "public"."download_history"("activityId");

-- AddForeignKey
ALTER TABLE "public"."download_history" ADD CONSTRAINT "download_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."download_history" ADD CONSTRAINT "download_history_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "public"."Activity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
