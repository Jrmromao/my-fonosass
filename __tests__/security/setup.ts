/**
 * Security Test Setup
 * 
 * Global setup for security tests
 */

import { beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';

// Global test timeout
jest.setTimeout(30000);

// Mock console methods to avoid noise in tests
const originalConsole = {
  log: console.log,
  error: console.error,
  warn: console.warn,
  info: console.info,
};

beforeAll(() => {
  // Suppress console output during tests unless explicitly enabled
  if (!process.env.ENABLE_TEST_LOGS) {
    console.log = jest.fn();
    console.error = jest.fn();
    console.warn = jest.fn();
    console.info = jest.fn();
  }
});

afterAll(() => {
  // Restore console methods
  console.log = originalConsole.log;
  console.error = originalConsole.error;
  console.warn = originalConsole.warn;
  console.info = originalConsole.info;
});

beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
});

afterEach(() => {
  // Clean up after each test
  jest.restoreAllMocks();
});

// Global error handler for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Global error handler for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

// Mock fetch if not available
if (!global.fetch) {
  global.fetch = jest.fn();
}

// Mock FormData if not available
if (!global.FormData) {
  global.FormData = class FormData {
    private data: Map<string, any> = new Map();
    
    append(key: string, value: any, filename?: string) {
      this.data.set(key, { value, filename });
    }
    
    get(key: string) {
      return this.data.get(key)?.value;
    }
    
    getAll(key: string) {
      return [this.data.get(key)?.value].filter(Boolean);
    }
    
    has(key: string) {
      return this.data.has(key);
    }
    
    delete(key: string) {
      this.data.delete(key);
    }
    
    set(key: string, value: any) {
      this.data.set(key, { value });
    }
    
    forEach(callback: (value: any, key: string) => void) {
      this.data.forEach((item, key) => callback(item.value, key));
    }
    
    entries() {
      return Array.from(this.data.entries()).map(([key, item]) => [key, item.value]);
    }
    
    keys() {
      return Array.from(this.data.keys());
    }
    
    values() {
      return Array.from(this.data.values()).map(item => item.value);
    }
    
    [Symbol.iterator]() {
      return this.entries()[Symbol.iterator]();
    }
  } as any;
}

// Mock Blob if not available
if (!global.Blob) {
  global.Blob = class Blob {
    constructor(public parts: any[] = [], public options: any = {}) {}
    
    get size() {
      return this.parts.reduce((size, part) => size + (part.length || 0), 0);
    }
    
    get type() {
      return this.options.type || '';
    }
    
    get bytes() {
      return new Uint8Array(this.parts.join('').split('').map(c => c.charCodeAt(0)));
    }
    
    slice(start?: number, end?: number, contentType?: string) {
      return new Blob(this.parts.slice(start, end), { ...this.options, type: contentType });
    }
    
    stream() {
      throw new Error('Blob.stream() not implemented in test environment');
    }
    
    text() {
      return Promise.resolve(this.parts.join(''));
    }
    
    arrayBuffer() {
      const text = this.parts.join('');
      const buffer = new ArrayBuffer(text.length);
      const view = new Uint8Array(buffer);
      for (let i = 0; i < text.length; i++) {
        view[i] = text.charCodeAt(i);
      }
      return Promise.resolve(buffer);
    }
  } as any;
}

// Mock Headers if not available
if (!global.Headers) {
  global.Headers = class Headers {
    private headers: Map<string, string> = new Map();
    
    constructor(init?: HeadersInit) {
      if (init) {
        if (Array.isArray(init)) {
          init.forEach(([key, value]) => this.set(key, value));
        } else if (init instanceof Headers) {
          init.forEach((value, key) => this.set(key, value));
        } else {
          Object.entries(init).forEach(([key, value]) => this.set(key, value));
        }
      }
    }
    
    append(name: string, value: string) {
      const existing = this.get(name);
      this.set(name, existing ? `${existing}, ${value}` : value);
    }
    
    delete(name: string) {
      this.headers.delete(name.toLowerCase());
    }
    
    get(name: string) {
      return this.headers.get(name.toLowerCase()) || null;
    }
    
    getSetCookie() {
      return this.headers.get('set-cookie') ? [this.headers.get('set-cookie')!] : [];
    }
    
    has(name: string) {
      return this.headers.has(name.toLowerCase());
    }
    
    set(name: string, value: string) {
      this.headers.set(name.toLowerCase(), value);
    }
    
    forEach(callback: (value: string, key: string) => void) {
      this.headers.forEach(callback);
    }
    
    entries() {
      return this.headers.entries();
    }
    
    keys() {
      return this.headers.keys();
    }
    
    values() {
      return this.headers.values();
    }
    
    [Symbol.iterator]() {
      return this.entries()[Symbol.iterator]();
    }
  } as any;
}

// Mock Response if not available
if (!global.Response) {
  global.Response = class Response {
    public status: number;
    public statusText: string;
    public headers: Headers;
    public body: ReadableStream | null;
    public bodyUsed: boolean = false;
    
    constructor(body?: BodyInit | null, init?: ResponseInit) {
      this.status = init?.status || 200;
      this.statusText = init?.statusText || 'OK';
      this.headers = new Headers(init?.headers);
      this.body = body ? new ReadableStream() : null;
    }
    
    get ok() {
      return this.status >= 200 && this.status < 300;
    }
    
    get redirected() {
      return this.status >= 300 && this.status < 400;
    }
    
    get type() {
      return 'basic';
    }
    
    get url() {
      return '';
    }
    
    static error() {
      return new Response(null, { status: 500, statusText: 'Internal Server Error' });
    }
    
    static json(data: any, init?: ResponseInit) {
      return new Response(JSON.stringify(data), {
        ...init,
        headers: { 'Content-Type': 'application/json', ...init?.headers },
      });
    }
    
    static redirect(url: string | URL, status?: number) {
      return new Response(null, { status: status || 302, headers: { Location: url.toString() } });
    }
    
    clone() {
      return new Response(this.body, {
        status: this.status,
        statusText: this.statusText,
        headers: this.headers,
      });
    }
    
    async arrayBuffer() {
      this.bodyUsed = true;
      return new ArrayBuffer(0);
    }
    
    async blob() {
      this.bodyUsed = true;
      return new Blob();
    }
    
    async formData() {
      this.bodyUsed = true;
      return new FormData();
    }
    
    async json() {
      this.bodyUsed = true;
      return {};
    }
    
    async text() {
      this.bodyUsed = true;
      return '';
    }
  } as any;
}

// Mock Request if not available
if (!global.Request) {
  global.Request = class Request {
    public method: string;
    public url: string;
    public headers: Headers;
    public body: ReadableStream | null;
    public bodyUsed: boolean = false;
    
    constructor(input: RequestInfo | URL, init?: RequestInit) {
      this.url = typeof input === 'string' ? input : input.toString();
      this.method = init?.method || 'GET';
      this.headers = new Headers(init?.headers);
      this.body = init?.body ? new ReadableStream() : null;
    }
    
    get cache() {
      return 'default';
    }
    
    get credentials() {
      return 'same-origin';
    }
    
    get destination() {
      return '';
    }
    
    get integrity() {
      return '';
    }
    
    get keepalive() {
      return false;
    }
    
    get mode() {
      return 'cors';
    }
    
    get redirect() {
      return 'follow';
    }
    
    get referrer() {
      return '';
    }
    
    get referrerPolicy() {
      return '';
    }
    
    get signal() {
      return new AbortSignal();
    }
    
    get bytes() {
      return new Uint8Array(0);
    }
    
    clone() {
      return new Request(this.url, {
        method: this.method,
        headers: this.headers,
        body: this.body,
      });
    }
    
    async arrayBuffer() {
      this.bodyUsed = true;
      return new ArrayBuffer(0);
    }
    
    async blob() {
      this.bodyUsed = true;
      return new Blob();
    }
    
    async formData() {
      this.bodyUsed = true;
      return new FormData();
    }
    
    async json() {
      this.bodyUsed = true;
      return {};
    }
    
    async text() {
      this.bodyUsed = true;
      return '';
    }
  } as any;
}

// Mock AbortSignal if not available
if (!global.AbortSignal) {
  global.AbortSignal = class AbortSignal {
    public aborted: boolean = false;
    public reason: any = undefined;
    
    static abort(reason?: any) {
      const signal = new AbortSignal();
      signal.aborted = true;
      signal.reason = reason;
      return signal;
    }
    
    static any(signals: AbortSignal[]) {
      const signal = new AbortSignal();
      // Mock implementation - check if any signal is aborted
      signal.aborted = signals.some(s => s.aborted);
      return signal;
    }
    
    static timeout(milliseconds: number) {
      const signal = new AbortSignal();
      // Mock implementation - would normally set a timeout
      return signal;
    }
    
    addEventListener(type: string, listener: EventListener) {
      // Mock implementation
    }
    
    removeEventListener(type: string, listener: EventListener) {
      // Mock implementation
    }
    
    dispatchEvent(event: Event) {
      return false;
    }
  } as any;
}

export {};
