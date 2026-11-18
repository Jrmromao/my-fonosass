import { csvCell } from '@/lib/security/csv';
import { getClientIp } from '@/lib/security/clientIp';
import { safeJsonLd } from '@/lib/security/jsonLd';
import { isCrossSiteMutation } from '@/lib/security/origin';
import { safeEqual } from '@/lib/security/safeCompare';
import { sanitizeHtml } from '@/lib/security/sanitizeHtml';

describe('safeEqual', () => {
  it('matches equal secrets and rejects different, empty or missing ones', () => {
    expect(safeEqual('abc123', 'abc123')).toBe(true);
    expect(safeEqual('abc123', 'abc124')).toBe(false);
    expect(safeEqual('short', 'a-much-longer-secret')).toBe(false);
    expect(safeEqual('', '')).toBe(false);
    expect(safeEqual(null, 'x')).toBe(false);
    expect(safeEqual('x', undefined)).toBe(false);
  });
});

describe('csvCell', () => {
  it('quotes values and doubles inner quotes', () => {
    expect(csvCell('a"b')).toBe('"a""b"');
  });
  it('neutralises spreadsheet formulas', () => {
    for (const bad of ['=1+1', '+SUM(A1)', '-2', '@cmd', '\tx']) {
      expect(csvCell(bad)).toMatch(/^"'/);
    }
  });
  it('handles null and numbers', () => {
    expect(csvCell(null)).toBe('""');
    expect(csvCell(42)).toBe('"42"');
  });
});

describe('getClientIp', () => {
  const ip = (h: Record<string, string>) =>
    getClientIp({ headers: new Headers(h) });
  it('prefers the platform headers over the client-appendable one', () => {
    expect(
      ip({
        'x-vercel-forwarded-for': '203.0.113.1',
        'x-forwarded-for': '6.6.6.6',
      })
    ).toBe('203.0.113.1');
    expect(
      ip({ 'x-real-ip': '203.0.113.2', 'x-forwarded-for': '6.6.6.6' })
    ).toBe('203.0.113.2');
  });
  it('falls back to the first forwarded hop and supports IPv6', () => {
    expect(ip({ 'x-forwarded-for': '198.51.100.7, 10.0.0.1' })).toBe(
      '198.51.100.7'
    );
    expect(ip({ 'x-real-ip': '2001:db8::1' })).toBe('2001:db8::1');
  });
  it('returns "unknown" for missing or hostile values', () => {
    expect(ip({})).toBe('unknown');
    expect(ip({ 'x-real-ip': "1.1.1.1'; DROP TABLE x;--" })).toBe('unknown');
  });
});

describe('safeJsonLd', () => {
  it('cannot be closed early by a </script> in data', () => {
    const out = safeJsonLd({ name: '</script><script>alert(1)</script>' });
    expect(out).not.toContain('</script>');
    expect(JSON.parse(out).name).toBe('</script><script>alert(1)</script>');
  });
});

describe('isCrossSiteMutation', () => {
  const base = { host: 'www.example.com' };
  it('refuses a mutating API call from another origin', () => {
    expect(
      isCrossSiteMutation({
        ...base,
        method: 'POST',
        pathname: '/api/user-data/delete',
        origin: 'https://evil.example',
      })
    ).toBe(true);
  });
  it('allows same-origin, no-Origin (webhooks/CI) and safe methods', () => {
    const same = { ...base, method: 'POST', pathname: '/api/x' };
    expect(
      isCrossSiteMutation({ ...same, origin: 'https://www.example.com' })
    ).toBe(false);
    expect(isCrossSiteMutation({ ...same, origin: null })).toBe(false);
    expect(
      isCrossSiteMutation({
        ...base,
        method: 'GET',
        pathname: '/api/x',
        origin: 'https://evil.example',
      })
    ).toBe(false);
  });
  it('ignores non-API paths and treats a malformed Origin as cross-site', () => {
    expect(
      isCrossSiteMutation({
        ...base,
        method: 'POST',
        pathname: '/dashboard',
        origin: 'https://evil.example',
      })
    ).toBe(false);
    expect(
      isCrossSiteMutation({
        ...base,
        method: 'POST',
        pathname: '/api/x',
        origin: 'not a url',
      })
    ).toBe(true);
  });
});

describe('sanitizeHtml', () => {
  it('removes scripts, handlers and javascript: links, keeps safe markup', () => {
    const out = sanitizeHtml(
      '<h2 class="t">Oi</h2><p onclick="x()">a<script>alert(1)</script></p>' +
        '<a href="javascript:alert(1)">l</a><img src="x" onerror="alert(1)">' +
        '<a href="https://ok.example" target="_blank">ok</a>'
    );
    expect(out).toContain('<h2 class="t">Oi</h2>');
    expect(out).not.toMatch(/script|onclick|onerror|javascript:/i);
    expect(out).toContain('rel="noopener noreferrer"');
  });
});
