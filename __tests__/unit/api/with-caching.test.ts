import { beforeEach, describe, expect, it, jest } from '@jest/globals';

// Minimal Response stand-in. Like a real Response, its body can be read only
// once, which is exactly what the old cache got wrong.
class MockResponse {
  status: number;
  headers: Headers;
  private body: string;
  private used = false;

  constructor(
    body: string,
    init: { status?: number; headers?: HeadersInit } = {}
  ) {
    this.body = body;
    this.status = init.status ?? 200;
    this.headers = new Headers(init.headers);
  }

  static json(data: unknown, init: { status?: number } = {}) {
    return new MockResponse(JSON.stringify(data), {
      ...init,
      headers: { 'content-type': 'application/json' },
    });
  }

  clone() {
    return new MockResponse(this.body, {
      status: this.status,
      headers: this.headers,
    });
  }

  async text() {
    if (this.used) return '';
    this.used = true;
    return this.body;
  }

  async json() {
    return JSON.parse(await this.text());
  }
}

// Getter: jest.mock is hoisted above the class, so resolve it lazily.
jest.mock('next/server', () => ({
  get NextResponse() {
    return MockResponse;
  },
}));

import { CacheManager, withCaching } from '@/lib/performance/cacheManager';

const req = { method: 'GET', url: 'http://localhost/api/x' } as never;

describe('withCaching', () => {
  beforeEach(() => CacheManager.clear());

  it('returns the full body on every cache hit, not only the first', async () => {
    const handler = jest.fn(
      async () => MockResponse.json({ success: true, data: [1, 2, 3] }) as never
    );
    const GET = withCaching(handler, { keyGenerator: () => 'test:key' });

    for (let i = 0; i < 4; i++) {
      const res = (await GET(req)) as unknown as MockResponse;
      expect(await res.json()).toEqual({ success: true, data: [1, 2, 3] });
    }
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('does not cache error responses', async () => {
    const handler = jest.fn(
      async () => MockResponse.json({ error: 'x' }, { status: 500 }) as never
    );
    const GET = withCaching(handler, { keyGenerator: () => 'test:error' });
    await GET(req);
    await GET(req);
    expect(handler).toHaveBeenCalledTimes(2);
  });
});
