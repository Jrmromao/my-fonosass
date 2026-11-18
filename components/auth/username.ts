import { isClerkAPIResponseError } from '@clerk/nextjs/errors';

// Both Clerk instances require a username, but the app never shows one, so it
// is generated from the email and completed silently. If the requirement is
// turned off in the Clerk Dashboard, `missingFields` won't list it and none
// of this runs.

/** Clerk usernames: 4-64 chars, letters, digits, "-" and "_". */
export function usernameFromEmail(email: string): string {
  const local = (email.split('@')[0] || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '_')
    .replace(/^[_-]+|[_-]+$/g, '')
    .slice(0, 40);
  const base = local.length >= 3 ? local : 'usuario';
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `${base}_${suffix}`;
}

interface SignUpLike {
  status: string | null;
  missingFields: string[];
  emailAddress: string | null;
  update: (params: { username: string }) => Promise<SignUpLike>;
}

const isTaken = (err: unknown) =>
  isClerkAPIResponseError(err) &&
  err.errors.some((e) => e.code === 'form_identifier_exists');

/**
 * If the sign-up only lacks a username, set a generated one. Retries a few
 * times if the generated name is already taken. Returns the updated sign-up.
 */
export async function completeMissingUsername<T extends SignUpLike>(
  signUp: T,
  email?: string
): Promise<T> {
  if (
    signUp.status !== 'missing_requirements' ||
    !signUp.missingFields.includes('username')
  ) {
    return signUp;
  }
  const source = email || signUp.emailAddress || '';
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      return (await signUp.update({
        username: usernameFromEmail(source),
      })) as T;
    } catch (err) {
      if (!isTaken(err) || attempt === 3) throw err;
    }
  }
  return signUp;
}
