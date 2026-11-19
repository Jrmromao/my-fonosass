import type { Breadcrumb, ErrorEvent, NodeOptions } from '@sentry/nextjs';

type TransactionEvent = Parameters<
  NonNullable<NodeOptions['beforeSendTransaction']>
>[0];

/**
 * LGPD: nothing that identifies a patient or therapist may leave the server.
 * These hooks run on every event before it is sent to Sentry.
 */

const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const CPF_RE = /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g;
const PHONE_RE = /(?:\+?55\s?)?\(?\d{2}\)?\s?9?\d{4}[-\s]?\d{4}\b/g;
// Opaque ids are fine to keep, but long numeric/cuid-like path segments after
// patient-related routes are replaced to avoid linking events to a person.
const PATIENT_PATH_RE =
  /(\/(?:pacientes?|patients?|prontuarios?)\/)[^/?#\s]+/gi;

export function scrubString(value: string): string {
  return value
    .replace(EMAIL_RE, '[email]')
    .replace(CPF_RE, '[cpf]')
    .replace(PHONE_RE, '[phone]')
    .replace(PATIENT_PATH_RE, '$1[id]');
}

function scrubUrl(url: string): string {
  // Query strings can carry tokens, emails and search terms.
  const withoutQuery = url.split(/[?#]/)[0] ?? url;
  return scrubString(withoutQuery);
}

export function scrubBreadcrumb(breadcrumb: Breadcrumb): Breadcrumb | null {
  // Console breadcrumbs are free text and often include request data.
  if (breadcrumb.category === 'console') return null;

  const scrubbed: Breadcrumb = { ...breadcrumb };
  if (scrubbed.message) scrubbed.message = scrubString(scrubbed.message);

  if (scrubbed.data) {
    const data: Record<string, unknown> = { ...scrubbed.data };
    for (const key of Object.keys(data)) {
      const value = data[key];
      if (key === 'url' && typeof value === 'string') {
        data[key] = scrubUrl(value);
      } else if (key === 'to' || key === 'from') {
        if (typeof value === 'string') data[key] = scrubUrl(value);
      } else if (typeof value === 'string') {
        data[key] = scrubString(value);
      } else {
        delete data[key];
      }
    }
    delete data.query;
    scrubbed.data = data;
  }
  return scrubbed;
}

export function scrubEvent(event: ErrorEvent): ErrorEvent | null {
  if (event.message) event.message = scrubString(event.message);

  for (const exception of event.exception?.values ?? []) {
    if (exception.value) exception.value = scrubString(exception.value);
  }

  if (event.request) {
    const { method, url } = event.request;
    event.request = {
      method,
      url: url ? scrubUrl(url) : undefined,
    };
  }

  // No user data at all: not even the opaque id (the privacy policy says
  // reports carry no account identification).
  delete event.user;

  // Server-side extras/contexts are free-form: drop them rather than guess.
  delete event.extra;
  if (event.contexts) {
    const { trace, runtime, os, browser } = event.contexts;
    event.contexts = { trace, runtime, os, browser };
  }

  if (event.breadcrumbs) {
    event.breadcrumbs = event.breadcrumbs
      .map(scrubBreadcrumb)
      .filter((b): b is Breadcrumb => b !== null);
  }

  // Only server_name leaks the host; remove it.
  delete event.server_name;
  return event;
}

/**
 * Performance transactions skip `beforeSend`. Span descriptions and data hold
 * URLs (including patient routes), so they get the same treatment.
 */
export function scrubTransaction(
  event: TransactionEvent
): TransactionEvent | null {
  if (event.transaction) event.transaction = scrubUrl(event.transaction);

  if (event.request) {
    const { method, url } = event.request;
    event.request = { method, url: url ? scrubUrl(url) : undefined };
  }
  delete event.user;
  delete event.extra;
  delete event.server_name;
  if (event.contexts) {
    const { trace, runtime, os, browser } = event.contexts;
    event.contexts = { trace, runtime, os, browser };
  }

  event.spans = (event.spans ?? []).map((span) => {
    const scrubbed = { ...span, data: {} };
    if (scrubbed.description)
      scrubbed.description = scrubUrl(scrubbed.description);
    // Span data is free-form (full URLs, queries, headers): drop it.
    return scrubbed;
  });
  return event;
}
