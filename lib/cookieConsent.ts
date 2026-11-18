'use client';

import { useSyncExternalStore } from 'react';

// Analytics consent, stored per browser. Nothing from Google Analytics is
// loaded until the visitor chooses "granted".

export type AnalyticsChoice = 'granted' | 'denied' | 'unset';
/** 'loading' only on the server and during hydration. */
export type AnalyticsConsent = AnalyticsChoice | 'loading';

export const CONSENT_STORAGE_KEY = 'almanaque:analytics-consent';
const CHANGE_EVENT = 'almanaque:analytics-consent-change';

export function readConsent(): AnalyticsChoice {
  try {
    const value = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    return value === 'granted' || value === 'denied' ? value : 'unset';
  } catch {
    // Storage blocked: treat as "not chosen" so nothing is loaded.
    return 'unset';
  }
}

export function writeConsent(choice: AnalyticsChoice): void {
  try {
    if (choice === 'unset') window.localStorage.removeItem(CONSENT_STORAGE_KEY);
    else window.localStorage.setItem(CONSENT_STORAGE_KEY, choice);
  } catch {
    /* storage blocked: the choice only lasts for this page view */
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function subscribe(callback: () => void) {
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}

export function useAnalyticsConsent(): AnalyticsConsent {
  return useSyncExternalStore<AnalyticsConsent>(
    subscribe,
    readConsent,
    () => 'loading'
  );
}

/** Removes the Google Analytics cookies (_ga, _ga_XXXX, _gid, _gat). */
export function clearAnalyticsCookies(): void {
  const host = window.location.hostname ?? '';
  const parts = host.split('.');
  const domains = [
    host,
    `.${host}`,
    ...(parts.length > 2 ? [`.${parts.slice(-2).join('.')}`] : []),
  ];
  document.cookie.split(';').forEach((cookie) => {
    const name = cookie.split('=')[0].trim();
    if (!/^_g(a|id|at)/.test(name)) return;
    const expired = 'expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    document.cookie = `${name}=; ${expired}`;
    domains.forEach((d) => {
      document.cookie = `${name}=; ${expired}; domain=${d}`;
    });
  });
}
