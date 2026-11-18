import { revalidatePath } from 'next/cache';

/**
 * Refresh the statically cached public pages that show catalog data (the
 * landing hero and phoneme counts, and the free samples on sign-in/sign-up).
 *
 * Call after anything that can change what they show: publishing,
 * unpublishing, rejecting or deleting an activity, replacing its files, or
 * changing the month's free samples. Without it the landing keeps its cached
 * render for up to `revalidate` (1 hour).
 */
export function refreshPublicCatalogPages(): void {
  revalidatePath('/');
  revalidatePath('/sign-in/[[...sign-in]]', 'page');
  revalidatePath('/sign-up/[[...sign-up]]', 'page');
}
