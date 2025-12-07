/**
 * File Upload Security Validation
 * Implements comprehensive security measures for file uploads
 */


// Allowed file types with MIME type validation
export const ALLOWED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp'],
  'text/plain': ['.txt'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
} as const;

// Maximum file size (10MB)
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Maximum filename length
export const MAX_FILENAME_LENGTH = 255;

// Dangerous file extensions that should be blocked
export const DANGEROUS_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar',
  '.php', '.asp', '.aspx', '.jsp', '.sh', '.ps1', '.py', '.rb', '.pl',
  '.cgi', '.htaccess', '.htpasswd'
];

// File validation result interface
export interface FileValidationResult {
  valid: boolean;
  error?: string;
  sanitizedFilename?: string;
}

// Type for File object from browser
export interface BrowserFile {
  name: string;
  size: number;
  type: string;
  arrayBuffer(): Promise<ArrayBuffer>;
}

/**
 * Validates file type based on MIME type and extension
 */
export function validateFileType(file: BrowserFile): FileValidationResult {
  // Check MIME type
  if (!Object.keys(ALLOWED_FILE_TYPES).includes(file.type)) {
    return {
      valid: false,
      error: `Tipo de arquivo não permitido: ${file.type}. Tipos aceitos: ${Object.keys(ALLOWED_FILE_TYPES).join(', ')}`
    };
  }

  // Check file extension
  const fileExtension = getFileExtension(file.name);
  const allowedExtensions = ALLOWED_FILE_TYPES[file.type as keyof typeof ALLOWED_FILE_TYPES] as readonly string[];
  
  if (!allowedExtensions.includes(fileExtension.toLowerCase())) {
    return {
      valid: false,
      error: `Extensão de arquivo não permitida: ${fileExtension}. Extensões aceitas: ${allowedExtensions.join(', ')}`
    };
  }

  return { valid: true };
}

/**
 * Validates file size
 */
export function validateFileSize(file: BrowserFile): FileValidationResult {
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `Arquivo muito grande: ${formatFileSize(file.size)}. Tamanho máximo permitido: ${formatFileSize(MAX_FILE_SIZE)}`
    };
  }

  if (file.size === 0) {
    return {
      valid: false,
      error: 'Arquivo vazio não é permitido'
    };
  }

  return { valid: true };
}

/**
 * Validates and sanitizes filename
 */
export function validateFilename(filename: string): FileValidationResult {
  // Check filename length
  if (filename.length > MAX_FILENAME_LENGTH) {
    return {
      valid: false,
      error: `Nome do arquivo muito longo: ${filename.length} caracteres. Máximo permitido: ${MAX_FILENAME_LENGTH}`
    };
  }

  // Check for dangerous extensions
  const fileExtension = getFileExtension(filename);
  if (DANGEROUS_EXTENSIONS.includes(fileExtension.toLowerCase())) {
    return {
      valid: false,
      error: `Extensão de arquivo perigosa não permitida: ${fileExtension}`
    };
  }

  // Check for suspicious patterns
  const suspiciousPatterns = [
    /\.\./,  // Directory traversal
    /[<>:"|?*]/,  // Invalid characters
    /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i,  // Windows reserved names
    /^\./,  // Hidden files
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(filename)) {
      return {
        valid: false,
        error: `Nome do arquivo contém caracteres ou padrões inválidos: ${filename}`
      };
    }
  }

  // Sanitize filename
  const sanitizedFilename = sanitizeFilename(filename);
  
  return {
    valid: true,
    sanitizedFilename
  };
}

/**
 * Validates file content for basic security checks
 */
export function validateFileContent(buffer: Buffer, fileType: string): FileValidationResult {
  // Check for empty file
  if (buffer.length === 0) {
    return {
      valid: false,
      error: 'Arquivo vazio não é permitido'
    };
  }

  // Check for suspicious file headers
  const suspiciousHeaders = [
    Buffer.from([0x4D, 0x5A]), // PE executable
    Buffer.from([0x7F, 0x45, 0x4C, 0x46]), // ELF executable
    Buffer.from([0xCA, 0xFE, 0xBA, 0xBE]), // Java class file
  ];

  for (const header of suspiciousHeaders) {
    if (buffer.subarray(0, header.length).equals(header)) {
      return {
        valid: false,
        error: 'Arquivo contém assinatura de executável, que não é permitido'
      };
    }
  }

  // Check for script tags in non-HTML files
  if (fileType.startsWith('text/') || fileType === 'application/pdf') {
    const content = buffer.toString('utf8', 0, Math.min(buffer.length, 1024));
    const scriptPatterns = [
      /<script/i,
      /javascript:/i,
      /vbscript:/i,
      /onload=/i,
      /onerror=/i,
    ];

    for (const pattern of scriptPatterns) {
      if (pattern.test(content)) {
        return {
          valid: false,
          error: 'Arquivo contém código potencialmente malicioso'
        };
      }
    }
  }

  return { valid: true };
}

/**
 * Comprehensive file validation
 */
export function validateFile(file: BrowserFile): FileValidationResult {
  // Validate file type
  const typeValidation = validateFileType(file);
  if (!typeValidation.valid) {
    return typeValidation;
  }

  // Validate file size
  const sizeValidation = validateFileSize(file);
  if (!sizeValidation.valid) {
    return sizeValidation;
  }

  // Validate filename
  const filenameValidation = validateFilename(file.name);
  if (!filenameValidation.valid) {
    return filenameValidation;
  }

  return {
    valid: true,
    sanitizedFilename: filenameValidation.sanitizedFilename
  };
}

/**
 * Validates file content after upload
 */
export async function validateFileContentAsync(file: BrowserFile): Promise<FileValidationResult> {
  const buffer = Buffer.from(await file.arrayBuffer());
  return validateFileContent(buffer, file.type);
}

/**
 * Utility functions
 */
function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  return lastDot === -1 ? '' : filename.substring(lastDot);
}

function sanitizeFilename(filename: string): string {
  // Remove or replace dangerous characters
  return filename
    .replace(/[<>:"|?*]/g, '_')  // Replace invalid characters with underscore
    .replace(/\.\./g, '_')  // Replace directory traversal with underscore
    .replace(/^\./, '')  // Remove leading dot
    .trim();
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Rate limiting for file uploads
 */
export class FileUploadRateLimiter {
  private uploads: Map<string, number[]> = new Map();
  private readonly maxUploadsPerMinute = 10;
  private readonly maxUploadsPerHour = 100;

  canUpload(userId: string): { allowed: boolean; error?: string } {
    const now = Date.now();
    const userUploads = this.uploads.get(userId) || [];
    
    // Clean old uploads (older than 1 hour)
    const oneHourAgo = now - (60 * 60 * 1000);
    const recentUploads = userUploads.filter(timestamp => timestamp > oneHourAgo);
    
    // Check hourly limit
    if (recentUploads.length >= this.maxUploadsPerHour) {
      return {
        allowed: false,
        error: 'Limite de uploads por hora excedido. Tente novamente mais tarde.'
      };
    }
    
    // Check minute limit
    const oneMinuteAgo = now - (60 * 1000);
    const recentMinuteUploads = recentUploads.filter(timestamp => timestamp > oneMinuteAgo);
    
    if (recentMinuteUploads.length >= this.maxUploadsPerMinute) {
      return {
        allowed: false,
        error: 'Limite de uploads por minuto excedido. Aguarde um momento antes de tentar novamente.'
      };
    }
    
    // Record this upload
    recentUploads.push(now);
    this.uploads.set(userId, recentUploads);
    
    return { allowed: true };
  }
}

// Global rate limiter instance
export const fileUploadRateLimiter = new FileUploadRateLimiter();
