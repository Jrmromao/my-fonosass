-- AddSlugToResources
ALTER TABLE "resources" ADD COLUMN "slug" TEXT;
CREATE UNIQUE INDEX "resources_slug_key" ON "resources"("slug");
