import type { NodeOptions } from '@sentry/nextjs';
import { scrubBreadcrumb, scrubEvent, scrubTransaction } from './sentryScrub';

/** SDK v11 defaults collect almost everything. Turn it all off (LGPD). */
export const SENTRY_DATA_COLLECTION: NonNullable<
  NodeOptions['dataCollection']
> = {
  userInfo: false,
  cookies: false,
  httpHeaders: false,
  httpBodies: [],
  urlQueryParams: false,
  databaseQueryData: false,
  queues: false,
  stackFrameVariables: false,
  genAI: { inputs: false, outputs: false },
  mcp: { inputs: false, outputs: false },
  graphQL: { document: false, variables: false },
};

/**
 * Shared server/edge options. Tracing is off by default (the privacy policy
 * does not cover performance traces); set SENTRY_TRACES_SAMPLE_RATE to enable.
 * Returns null when no DSN is configured, so
 * local dev and CI stay silent without any Sentry setup.
 */
export function getSentryOptions(): NodeOptions | null {
  // One DSN serves both: the browser needs the NEXT_PUBLIC_ copy anyway.
  const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return null;

  const sampleRate = Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? '0');

  return {
    dsn,
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
    release: process.env.VERCEL_GIT_COMMIT_SHA,
    dataCollection: SENTRY_DATA_COLLECTION,
    tracesSampleRate: Number.isFinite(sampleRate) ? sampleRate : 0,
    beforeSend: scrubEvent,
    beforeSendTransaction: scrubTransaction,
    beforeBreadcrumb: scrubBreadcrumb,
  };
}
