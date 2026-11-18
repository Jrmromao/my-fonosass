'use client';

import { writeConsent } from '@/lib/cookieConsent';

/** Footer link that asks the analytics question again. */
export default function CookiePreferencesLink({
  className,
}: {
  className?: string;
}) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => writeConsent('unset')}
    >
      Preferências de cookies
    </button>
  );
}
