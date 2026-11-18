import * as Sentry from '@sentry/nextjs';
import { CONSENT_STORAGE_KEY, readConsent } from '@/lib/cookieConsent';
import { SENTRY_DATA_COLLECTION } from '@/lib/monitoring/sentryOptions';
import { scrubBreadcrumb, scrubEvent } from '@/lib/monitoring/sentryScrub';

/**
 * Browser error reporting. Runs only after the visitor grants the same
 * consent used for analytics (LGPD). Errors only: no tracing, no replay.
 * Must read NEXT_PUBLIC_SENTRY_DSN literally so Next inlines it.
 */
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

let running = false;

function sync() {
  if (!dsn) return;
  const granted = readConsent() === 'granted';

  if (granted && !running) {
    running = true;
    Sentry.init({
      dsn,
      environment: process.env.NODE_ENV,
      dataCollection: SENTRY_DATA_COLLECTION,
      tracesSampleRate: 0,
      beforeSend: scrubEvent,
      beforeBreadcrumb: scrubBreadcrumb,
    });
  } else if (!granted && running) {
    running = false;
    void Sentry.close();
  }
}

sync();
window.addEventListener('almanaque:analytics-consent-change', sync);
window.addEventListener('storage', (event) => {
  if (event.key === CONSENT_STORAGE_KEY || event.key === null) sync();
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
