import {
  buildContentSecurityPolicy,
  buildReportOnlyContentSecurityPolicy,
  generateNonce,
} from '@/lib/security/csp';

const scriptSrc = (csp: string) =>
  csp.split('; ').find((d) => d.startsWith('script-src '))!;

describe('Content-Security-Policy', () => {
  it('NONCE mode: nonce, no unsafe-inline, no unsafe-eval in production', () => {
    const nonce = generateNonce();
    const src = scriptSrc(buildContentSecurityPolicy(nonce, false));
    expect(src).toContain(`'nonce-${nonce}'`);
    expect(src).not.toContain("'unsafe-inline'");
    expect(src).not.toContain("'unsafe-eval'");
  });

  it('STATIC mode (cached public pages): unsafe-inline, no nonce', () => {
    const src = scriptSrc(buildContentSecurityPolicy(undefined, false));
    expect(src).toContain("'unsafe-inline'");
    expect(src).not.toContain('nonce-');
    expect(src).not.toContain("'unsafe-eval'");
  });

  it('allows eval only in development', () => {
    expect(scriptSrc(buildContentSecurityPolicy('n', true))).toContain(
      "'unsafe-eval'"
    );
  });

  it('keeps the framing, base and plugin lockdown in both modes', () => {
    for (const csp of [
      buildContentSecurityPolicy('n', false),
      buildContentSecurityPolicy(undefined, false),
    ]) {
      expect(csp).toContain("frame-ancestors 'none'");
      expect(csp).toContain("object-src 'none'");
      expect(csp).toContain("base-uri 'self'");
    }
  });

  it('generates a different nonce every time', () => {
    expect(generateNonce()).not.toBe(generateNonce());
  });

  it('report-only policy lists exact hosts (no bare https: / wss:) and reports', () => {
    const csp = buildReportOnlyContentSecurityPolicy('n');
    const directive = (name: string) =>
      csp.split('; ').find((d) => d.startsWith(`${name} `)) ?? '';
    for (const name of ['connect-src', 'img-src', 'frame-src']) {
      expect(directive(name).split(' ')).not.toContain('https:');
    }
    expect(directive('connect-src').split(' ')).not.toContain('wss:');
    expect(csp).toContain('report-uri /api/csp-report');
    // ignored (and warned about) in report-only mode
    expect(csp).not.toContain('upgrade-insecure-requests');
  });

  it('enforced policy reports violations too', () => {
    expect(buildContentSecurityPolicy('n', false)).toContain(
      'report-uri /api/csp-report'
    );
  });
});
