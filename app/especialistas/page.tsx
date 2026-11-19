import { notFound } from 'next/navigation';

// Hidden: the specialist directory isn't part of the product right now (its
// listings were placeholders). The page answers 404 and is linked from
// nowhere (footer, sitemap, robots.txt). The UI stays in
// ./EspecialistasClient.tsx in case it comes back; to restore, render it
// here again and re-add the links.

export default function EspecialistasPage() {
  notFound();
}
