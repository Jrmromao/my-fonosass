import { z } from 'zod';

// Enhanced input validation with security focus
export class InputValidator {
  // Common validation schemas
  static readonly schemas = {
    email: z.string()
      .email('Invalid email format')
      .min(1, 'Email is required')
      .max(254, 'Email too long')
      .transform(email => email.toLowerCase().trim()),

    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password too long')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
        'Password must contain uppercase, lowercase, number and special character'),

    name: z.string()
      .min(1, 'Name is required')
      .max(100, 'Name too long')
      .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Name contains invalid characters')
      .transform(name => this.sanitizeString(name)),

    phone: z.string()
      .regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format')
      .transform(phone => phone.replace(/\D/g, '')), // Remove non-digits

    url: z.string()
      .url('Invalid URL format')
      .max(2048, 'URL too long')
      .refine(url => {
        try {
          const parsed = new URL(url);
          return ['http:', 'https:'].includes(parsed.protocol);
        } catch {
          return false;
        }
      }, 'Invalid URL protocol'),

    file: z.object({
      name: z.string()
        .min(1, 'File name is required')
        .max(255, 'File name too long')
        .regex(/^[a-zA-Z0-9._-]+$/, 'Invalid file name characters'),
      size: z.number()
        .min(1, 'File size must be greater than 0')
        .max(50 * 1024 * 1024, 'File size too large (max 50MB)'),
      type: z.string()
        .min(1, 'File type is required')
        .refine(type => this.isAllowedFileType(type), 'File type not allowed')
    }),

    searchQuery: z.string()
      .min(1, 'Search query is required')
      .max(200, 'Search query too long')
      .transform(query => this.sanitizeString(query)),

    pagination: z.object({
      page: z.number().int().min(1).max(1000).default(1),
      limit: z.number().int().min(1).max(100).default(20),
      sortBy: z.string().max(50).optional(),
      sortOrder: z.enum(['asc', 'desc']).default('desc')
    })
  };

  // Sanitize string input to prevent XSS and injection attacks
  static sanitizeString(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove HTML tags
      .replace(/['"]/g, '') // Remove quotes
      .replace(/[;]/g, '') // Remove semicolons
      .replace(/[--]/g, '') // Remove SQL comments
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove SQL block comments
      .replace(/script/gi, '') // Remove script tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .trim();
  }

  // Validate and sanitize object recursively
  static sanitizeObject<T>(obj: T): T {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }
    
    const sanitized = {} as T;
    
    for (const [key, value] of Object.entries(obj as Record<string, any>)) {
      if (typeof value === 'string') {
        (sanitized as any)[key] = this.sanitizeString(value);
      } else if (typeof value === 'object' && value !== null) {
        (sanitized as any)[key] = this.sanitizeObject(value);
      } else {
        (sanitized as any)[key] = value;
      }
    }
    
    return sanitized;
  }

  // Check if file type is allowed
  static isAllowedFileType(mimeType: string): boolean {
    const allowedTypes = [
      // Images
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      
      // Documents
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      
      // Text
      'text/plain',
      'text/csv',
      'text/rtf',
      
      // Audio
      'audio/mpeg',
      'audio/wav',
      'audio/ogg',
      'audio/mp4',
      
      // Video
      'video/mp4',
      'video/avi',
      'video/mov',
      'video/wmv',
      'video/webm',
      
      // Archives
      'application/zip',
      'application/x-rar-compressed',
      'application/x-7z-compressed'
    ];

    return allowedTypes.includes(mimeType);
  }

  // Validate file upload
  static validateFileUpload(file: File): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      errors.push('File size exceeds 50MB limit');
    }

    // Check file type
    if (!this.isAllowedFileType(file.type)) {
      errors.push(`File type ${file.type} is not allowed`);
    }

    // Check file name
    if (!/^[a-zA-Z0-9._-]+$/.test(file.name)) {
      errors.push('File name contains invalid characters');
    }

    // Check for suspicious file extensions
    const suspiciousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com', '.vbs', '.js'];
    const hasSuspiciousExtension = suspiciousExtensions.some(ext => 
      file.name.toLowerCase().endsWith(ext)
    );
    
    if (hasSuspiciousExtension) {
      errors.push('File extension is not allowed for security reasons');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Validate SQL query parameters to prevent injection
  static validateSQLParams(params: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(params)) {
      if (typeof value === 'string') {
        // Remove potential SQL injection patterns
        const sanitizedValue = value
          .replace(/['"]/g, '') // Remove quotes
          .replace(/[;]/g, '') // Remove semicolons
          .replace(/[--]/g, '') // Remove SQL comments
          .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
          .replace(/union/gi, '') // Remove UNION
          .replace(/select/gi, '') // Remove SELECT
          .replace(/insert/gi, '') // Remove INSERT
          .replace(/update/gi, '') // Remove UPDATE
          .replace(/delete/gi, '') // Remove DELETE
          .replace(/drop/gi, '') // Remove DROP
          .replace(/create/gi, '') // Remove CREATE
          .replace(/alter/gi, '') // Remove ALTER
          .trim();
        
        sanitized[key] = sanitizedValue;
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }

  // Validate and parse JSON safely
  static safeJSONParse<T>(jsonString: string, fallback: T): T {
    try {
      const parsed = JSON.parse(jsonString);
      return this.sanitizeObject(parsed) as T;
    } catch {
      return fallback;
    }
  }

  // Validate URL parameters
  static validateURLParams(params: URLSearchParams): Record<string, string> {
    const validated: Record<string, string> = {};
    
    for (const [key, value] of params.entries()) {
      // Only allow alphanumeric keys
      if (!/^[a-zA-Z0-9_-]+$/.test(key)) {
        continue;
      }
      
      // Sanitize value
      const sanitizedValue = this.sanitizeString(value);
      if (sanitizedValue.length > 0) {
        validated[key] = sanitizedValue;
      }
    }
    
    return validated;
  }

  // Create validation middleware for API routes
  static createValidationMiddleware<T>(schema: z.ZodSchema<T>) {
    return async (req: Request): Promise<{ data: T; error?: never } | { data?: never; error: string }> => {
      try {
        const body = await req.json();
        const data = schema.parse(body);
        return { data: this.sanitizeObject(data) as T };
      } catch (error) {
        if (error instanceof z.ZodError) {
          const errorMessage = error.errors
            .map(err => `${err.path.join('.')}: ${err.message}`)
            .join(', ');
          return { error: `Validation error: ${errorMessage}` };
        }
        return { error: 'Invalid request body' };
      }
    };
  }
}
