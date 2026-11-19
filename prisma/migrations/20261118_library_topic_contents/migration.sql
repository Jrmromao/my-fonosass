-- Admin-edited library topic paragraphs. Additive: new table only.
-- CreateTable
CREATE TABLE "public"."library_topic_contents" (
    "slug" TEXT NOT NULL,
    "about" TEXT NOT NULL,
    "updatedById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "library_topic_contents_pkey" PRIMARY KEY ("slug")
);

