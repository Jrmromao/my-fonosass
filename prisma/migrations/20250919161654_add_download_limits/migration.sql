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

-- CreateIndex
CREATE UNIQUE INDEX "download_limits_userId_key" ON "public"."download_limits"("userId");
