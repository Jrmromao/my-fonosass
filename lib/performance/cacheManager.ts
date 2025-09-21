import { NextRequest, NextResponse } from 'next/server';

export interface CacheConfig {
  ttl: number; // Time to live in seconds
  maxSize: number; // Maximum number of items
  strategy: 'lru' | 'fifo' | 'ttl';
}

export interface CacheEntry<T = any> {
  key: string;
  value: T;
  timestamp: number;
  ttl: number;
  hits: number;
}

export class CacheManager {
  private static cache = new Map<string, CacheEntry>();
  private static config: CacheConfig = {
    ttl: 300, // 5 minutes default
    maxSize: 1000,
    strategy: 'lru'
  };

  static setConfig(config: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...config };
  }

  static set<T>(key: string, value: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      key,
      value,
      timestamp: Date.now(),
      ttl: ttl || this.config.ttl,
      hits: 0
    };

    // Check if we need to evict items
    if (this.cache.size >= this.config.maxSize) {
      this.evict();
    }

    this.cache.set(key, entry);
  }

  static get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl * 1000) {
      this.cache.delete(key);
      return null;
    }

    // Update hit count
    entry.hits++;
    
    return entry.value;
  }

  static has(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl * 1000) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  static delete(key: string): boolean {
    return this.cache.delete(key);
  }

  static clear(): void {
    this.cache.clear();
  }

  static getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    totalHits: number;
    entries: Array<{
      key: string;
      age: number;
      hits: number;
      ttl: number;
    }>;
  } {
    const entries = Array.from(this.cache.values()).map(entry => ({
      key: entry.key,
      age: Date.now() - entry.timestamp,
      hits: entry.hits,
      ttl: entry.ttl
    }));

    const totalHits = entries.reduce((sum, entry) => sum + entry.hits, 0);
    const hitRate = totalHits > 0 ? totalHits / (totalHits + this.cache.size) : 0;

    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitRate: Math.round(hitRate * 100) / 100,
      totalHits,
      entries: entries.sort((a, b) => b.hits - a.hits)
    };
  }

  private static evict(): void {
    switch (this.config.strategy) {
      case 'lru':
        this.evictLRU();
        break;
      case 'fifo':
        this.evictFIFO();
        break;
      case 'ttl':
        this.evictTTL();
        break;
    }
  }

  private static evictLRU(): void {
    // Remove least recently used (lowest hit count)
    let lruKey = '';
    let minHits = Infinity;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.hits < minHits) {
        minHits = entry.hits;
        lruKey = key;
      }
    }
    
    if (lruKey) {
      this.cache.delete(lruKey);
    }
  }

  private static evictFIFO(): void {
    // Remove first in (oldest timestamp)
    let oldestKey = '';
    let oldestTime = Infinity;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  private static evictTTL(): void {
    // Remove expired entries
    const now = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl * 1000) {
        this.cache.delete(key);
      }
    }
  }
}

// HTTP caching utilities
export class HTTPCache {
  static createCacheHeaders(ttl: number = 300): Record<string, string> {
    const maxAge = Math.floor(ttl);
    const expires = new Date(Date.now() + ttl * 1000).toUTCString();
    
    return {
      'Cache-Control': `public, max-age=${maxAge}, s-maxage=${maxAge}`,
      'Expires': expires,
      'ETag': `"${Date.now()}"`,
      'Last-Modified': new Date().toUTCString()
    };
  }

  static createNoCacheHeaders(): Record<string, string> {
    return {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    };
  }

  static createPrivateCacheHeaders(ttl: number = 60): Record<string, string> {
    const maxAge = Math.floor(ttl);
    
    return {
      'Cache-Control': `private, max-age=${maxAge}`,
      'ETag': `"${Date.now()}"`
    };
  }

  static checkETag(request: NextRequest, etag: string): boolean {
    const ifNoneMatch = request.headers.get('if-none-match');
    return ifNoneMatch === etag;
  }

  static checkLastModified(request: NextRequest, lastModified: Date): boolean {
    const ifModifiedSince = request.headers.get('if-modified-since');
    if (!ifModifiedSince) return false;
    
    const clientDate = new Date(ifModifiedSince);
    return clientDate >= lastModified;
  }
}

// Database query caching
export class QueryCache {
  private static cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  static async get<T>(
    key: string,
    queryFn: () => Promise<T>,
    ttl: number = 300
  ): Promise<T> {
    const cached = this.cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < cached.ttl * 1000) {
      return cached.data;
    }

    const data = await queryFn();
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });

    return data;
  }

  static invalidate(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  static clear(): void {
    this.cache.clear();
  }
}

// API response caching middleware
export function withCaching<T extends any[]>(
  handler: (req: NextRequest, ...args: T) => Promise<NextResponse>,
  options: {
    ttl?: number;
    keyGenerator?: (req: NextRequest) => string;
    skipCache?: (req: NextRequest) => boolean;
  } = {}
) {
  return async function(req: NextRequest, ...args: T): Promise<NextResponse> {
    const {
      ttl = 300,
      keyGenerator = (req) => `${req.method}:${req.url}`,
      skipCache = () => false
    } = options;

    // Skip caching for certain requests
    if (skipCache(req)) {
      return handler(req, ...args);
    }

    const cacheKey = keyGenerator(req);
    const cached = CacheManager.get<NextResponse>(cacheKey);

    if (cached) {
      // Add cache hit headers
      cached.headers.set('X-Cache', 'HIT');
      cached.headers.set('X-Cache-Key', cacheKey);
      return cached;
    }

    // Execute handler
    const response = await handler(req, ...args);

    // Only cache successful responses
    if (response.status >= 200 && response.status < 300) {
      // Clone response for caching
      const responseClone = response.clone();
      
      // Add cache headers
      response.headers.set('X-Cache', 'MISS');
      response.headers.set('X-Cache-Key', cacheKey);
      Object.entries(HTTPCache.createCacheHeaders(ttl)).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      // Cache the response
      CacheManager.set(cacheKey, responseClone, ttl);
    }

    return response;
  };
}
