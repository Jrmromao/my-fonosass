// Mock for Next.js server modules to avoid ESM parsing issues
class MockNextRequest {
  constructor(url, init = {}) {
    this.url = url;
    this.method = init.method || 'GET';
    this.headers = new Map();
    this.body = init.body || null;
    
    // Set headers
    if (init.headers) {
      Object.entries(init.headers).forEach(([key, value]) => {
        this.headers.set(key.toLowerCase(), value);
      });
    }
  }

  async json() {
    if (!this.body) {
      throw new Error('Request body is null');
    }
    
    try {
      return JSON.parse(this.body);
    } catch (error) {
      throw new Error('Invalid JSON');
    }
  }

  async text() {
    return this.body || '';
  }

  async formData() {
    // Mock implementation for form data
    return new FormData();
  }

  clone() {
    return new MockNextRequest(this.url, {
      method: this.method,
      body: this.body,
      headers: Object.fromEntries(this.headers.entries())
    });
  }
}

class MockNextResponse {
  constructor(body, init = {}) {
    this.body = body;
    this.status = init.status || 200;
    this.statusText = init.statusText || 'OK';
    this.headers = new Map();
    
    if (init.headers) {
      Object.entries(init.headers).forEach(([key, value]) => {
        this.headers.set(key.toLowerCase(), value);
      });
    }
  }

  async json() {
    return JSON.parse(this.body);
  }

  async text() {
    return this.body;
  }

  static json(data, init = {}) {
    return new MockNextResponse(JSON.stringify(data), {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...init.headers
      }
    });
  }

  static error(message, init = {}) {
    return new MockNextResponse(JSON.stringify({ error: message }), {
      status: 500,
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...init.headers
      }
    });
  }
}

module.exports = {
  NextRequest: MockNextRequest,
  NextResponse: MockNextResponse,
};
