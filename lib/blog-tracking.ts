import 'server-only';
import { prisma } from '@/app/db';
import { getPostBySlug } from '@/lib/blog';
import { getPostFromS3 } from '@/lib/blog-s3';

/** Same shape as real blog slugs; also blocks path traversal into getPostBySlug. */
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isValidBlogSlug(slug: string): boolean {
  return slug.length <= 120 && SLUG_PATTERN.test(slug);
}

/**
 * Returns the tracking row for a REAL blog post, creating it lazily.
 * Unknown slugs return null so anonymous callers cannot create rows for
 * arbitrary strings.
 */
export async function getTrackedBlogPost(slug: string) {
  if (!isValidBlogSlug(slug)) return null;

  const existing = await prisma.blogPost.findUnique({ where: { slug } });
  if (existing) return existing;

  const source = getPostBySlug(slug) ?? (await getPostFromS3(slug));
  if (!source) return null;

  return prisma.blogPost.upsert({
    where: { slug },
    update: {},
    create: {
      slug,
      title: slug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      viewCount: 0,
      likeCount: 0,
    },
  });
}

export const truncate = (value: unknown, max: number): string | null =>
  typeof value === 'string' && value ? value.slice(0, max) : null;
