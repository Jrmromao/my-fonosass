import { prisma } from '@/app/db';

export async function GET() {
  const resources = await prisma.resource.findMany({
    where: {
      isPublished: true,
    },
    select: {
      id: true,
      slug: true,
      updatedAt: true,
    },
  });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${resources
    .map(
      (resource) => `
  <url>
    <loc>https://www.almanaquedafala.com.br/recursos/${resource.slug || resource.id}</loc>
    <lastmod>${resource.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
    )
    .join('')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
