import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

jest.mock('next/navigation', () => ({
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));
jest.mock('next/script', () => ({
  __esModule: true,
  default: ({ id, src }: { id?: string; src?: string }) => (
    <div data-testid="ga-script" data-id={id} data-src={src} />
  ),
}));

import AnalyticsConsentBanner from '@/components/cookies/AnalyticsConsentBanner';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import {
  CONSENT_STORAGE_KEY,
  readConsent,
  writeConsent,
} from '@/lib/cookieConsent';

describe('analytics consent', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('reads "unset" until the visitor chooses', () => {
    expect(readConsent()).toBe('unset');
    writeConsent('granted');
    expect(window.localStorage.getItem(CONSENT_STORAGE_KEY)).toBe('granted');
    expect(readConsent()).toBe('granted');
    writeConsent('unset');
    expect(readConsent()).toBe('unset');
  });

  it('does not load Google Analytics before consent', () => {
    render(<GoogleAnalytics GA_MEASUREMENT_ID="G-TEST" />);
    expect(screen.queryByTestId('ga-script')).toBeNull();
  });

  it('does not load Google Analytics after a refusal', () => {
    writeConsent('denied');
    render(<GoogleAnalytics GA_MEASUREMENT_ID="G-TEST" />);
    expect(screen.queryByTestId('ga-script')).toBeNull();
  });

  it('loads Google Analytics once accepted, and stops when withdrawn', () => {
    render(<GoogleAnalytics GA_MEASUREMENT_ID="G-TEST" />);
    act(() => writeConsent('granted'));
    expect(screen.getAllByTestId('ga-script').length).toBeGreaterThan(0);
    act(() => writeConsent('denied'));
    expect(screen.queryByTestId('ga-script')).toBeNull();
    expect(
      (window as unknown as Record<string, boolean>)['ga-disable-G-TEST']
    ).toBe(true);
  });

  it('shows the banner only while the choice is unset', () => {
    render(<AnalyticsConsentBanner />);
    expect(screen.getByRole('dialog')).toBeTruthy();
    act(() => screen.getByRole('button', { name: 'Aceitar' }).click());
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(readConsent()).toBe('granted');
  });

  it('records a refusal', () => {
    render(<AnalyticsConsentBanner />);
    act(() => screen.getByRole('button', { name: 'Recusar' }).click());
    expect(readConsent()).toBe('denied');
  });
});
