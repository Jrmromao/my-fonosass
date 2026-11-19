import 'server-only';

import { prisma } from '@/app/db';
import { findTopic, listTopics } from '@/lib/libraryTopics';

// Paragraph of each library topic: the admin's text (LibraryTopicContent)
// when there is one, otherwise the default in lib/libraryTopics.ts.

export const TOPIC_ABOUT_MAX = 800;

/** Paragraph for a topic page, or null for an unknown slug. */
export async function getTopicAbout(slug: string): Promise<string | null> {
  const topic = findTopic(slug);
  if (!topic) return null;
  const row = await prisma.libraryTopicContent.findUnique({
    where: { slug },
    select: { about: true },
  });
  return row?.about ?? topic.about;
}

export interface AdminTopicContent {
  slug: string;
  title: string;
  defaultAbout: string;
  /** Admin text, or null when the default is in use. */
  customAbout: string | null;
  updatedAt: string | null;
}

/** Every editable topic with its default and custom text (admin card). */
export async function listTopicContents(): Promise<AdminTopicContent[]> {
  const rows = await prisma.libraryTopicContent.findMany({
    select: { slug: true, about: true, updatedAt: true },
  });
  const bySlug = new Map(rows.map((r) => [r.slug, r]));
  return listTopics().map((t) => {
    const row = bySlug.get(t.slug);
    return {
      slug: t.slug,
      title: t.title,
      defaultAbout: t.about,
      customAbout: row?.about ?? null,
      updatedAt: row?.updatedAt.toISOString() ?? null,
    };
  });
}
