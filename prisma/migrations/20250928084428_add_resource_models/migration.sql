-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('PDF', 'VIDEO', 'AUDIO', 'GUIDE', 'DOCUMENT', 'PRESENTATION', 'WORKSHEET', 'IMAGE', 'INTERACTIVE');

-- CreateTable
CREATE TABLE "resource_categories" (
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
CREATE TABLE "resources" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "ResourceType" NOT NULL,
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
CREATE TABLE "resource_files" (
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
CREATE TABLE "resource_downloads" (
    "id" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "userId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "downloadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resource_downloads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resource_views" (
    "id" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "userId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resource_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resource_ratings" (
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
CREATE TABLE "_ResourceToCategory" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "resource_categories_name_key" ON "resource_categories"("name");

-- CreateIndex
CREATE INDEX "resources_isPublished_createdAt_idx" ON "resources"("isPublished", "createdAt");

-- CreateIndex
CREATE INDEX "resources_type_category_idx" ON "resources"("type", "category");

-- CreateIndex
CREATE INDEX "resources_isFree_isFeatured_idx" ON "resources"("isFree", "isFeatured");

-- CreateIndex
CREATE INDEX "resources_createdById_idx" ON "resources"("createdById");

-- CreateIndex
CREATE INDEX "resources_title_idx" ON "resources"("title");

-- CreateIndex
CREATE INDEX "resource_files_resourceId_idx" ON "resource_files"("resourceId");

-- CreateIndex
CREATE INDEX "resource_files_fileType_idx" ON "resource_files"("fileType");

-- CreateIndex
CREATE INDEX "resource_files_uploadedById_idx" ON "resource_files"("uploadedById");

-- CreateIndex
CREATE INDEX "resource_downloads_resourceId_idx" ON "resource_downloads"("resourceId");

-- CreateIndex
CREATE INDEX "resource_downloads_userId_downloadedAt_idx" ON "resource_downloads"("userId", "downloadedAt");

-- CreateIndex
CREATE INDEX "resource_downloads_downloadedAt_idx" ON "resource_downloads"("downloadedAt");

-- CreateIndex
CREATE INDEX "resource_views_resourceId_idx" ON "resource_views"("resourceId");

-- CreateIndex
CREATE INDEX "resource_views_userId_viewedAt_idx" ON "resource_views"("userId", "viewedAt");

-- CreateIndex
CREATE INDEX "resource_views_viewedAt_idx" ON "resource_views"("viewedAt");

-- CreateIndex
CREATE INDEX "resource_ratings_resourceId_idx" ON "resource_ratings"("resourceId");

-- CreateIndex
CREATE INDEX "resource_ratings_userId_idx" ON "resource_ratings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "resource_ratings_resourceId_userId_key" ON "resource_ratings"("resourceId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "_ResourceToCategory_AB_unique" ON "_ResourceToCategory"("A", "B");

-- CreateIndex
CREATE INDEX "_ResourceToCategory_B_index" ON "_ResourceToCategory"("B");

-- AddForeignKey
ALTER TABLE "resources" ADD CONSTRAINT "resources_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_files" ADD CONSTRAINT "resource_files_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_downloads" ADD CONSTRAINT "resource_downloads_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_downloads" ADD CONSTRAINT "resource_downloads_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_views" ADD CONSTRAINT "resource_views_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_views" ADD CONSTRAINT "resource_views_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_ratings" ADD CONSTRAINT "resource_ratings_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_ratings" ADD CONSTRAINT "resource_ratings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ResourceToCategory" ADD CONSTRAINT "_ResourceToCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ResourceToCategory" ADD CONSTRAINT "_ResourceToCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "resource_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
