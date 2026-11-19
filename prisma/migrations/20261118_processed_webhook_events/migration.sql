-- Webhook idempotency (Stripe delivers at least once). Additive: new table only.
-- CreateTable
CREATE TABLE "public"."processed_webhook_events" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "processed_webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "processed_webhook_events_processedAt_idx" ON "public"."processed_webhook_events"("processedAt");

