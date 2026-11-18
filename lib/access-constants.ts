// Client-safe constants for the access rules (lib/access.ts imports Prisma
// and can't be bundled into client components).

/** Number of free activities per month (see lib/access.ts). */
export const FREE_SAMPLE_COUNT = 2;

/** Phoneme of the default free samples (months without an admin choice).
 * Must match Activity.phoneme (uppercase). */
export const FREE_DEFAULT_PHONEME = 'S';
