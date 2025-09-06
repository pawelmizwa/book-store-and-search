import { Injectable, NestMiddleware } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import validator from 'validator';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// Create DOM for DOMPurify in Node.js environment
const window = new JSDOM('').window;
const purify = DOMPurify(window as any);

@Injectable()
export class InputSanitizationMiddleware implements NestMiddleware {
  use(req: FastifyRequest, res: FastifyReply, next: () => void) {
    try {
      // Sanitize query parameters
      if (req.query && typeof req.query === 'object') {
        req.query = this.sanitizeObject(req.query);
      }

      // Sanitize request body
      if (req.body && typeof req.body === 'object') {
        req.body = this.sanitizeObject(req.body);
      }

      // Sanitize path parameters
      if (req.params && typeof req.params === 'object') {
        req.params = this.sanitizeObject(req.params);
      }

      next();
    } catch (error) {
      console.error('Input sanitization error:', error);
      next(); // Continue even if sanitization fails to avoid breaking the request
    }
  }

  private sanitizeObject(obj: any): any {
    if (typeof obj === 'string') {
      return this.sanitizeString(obj);
    }

    if (typeof obj === 'number' || typeof obj === 'boolean' || obj === null) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }

    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        // Sanitize the key as well
        const sanitizedKey = this.sanitizeString(key);
        sanitized[sanitizedKey] = this.sanitizeObject(value);
      }
      return sanitized;
    }

    return obj;
  }

  private sanitizeString(str: string): string {
    if (typeof str !== 'string') return str;

    // Basic validation and length limit
    if (str.length > 10000) {
      str = str.substring(0, 10000);
    }

    // Use DOMPurify for HTML sanitization (removes HTML tags but doesn't escape)
    str = purify.sanitize(str, { 
      ALLOWED_TAGS: [], // No HTML tags allowed
      ALLOWED_ATTR: [] // No attributes allowed
    });

    // Additional validation for common patterns
    str = str.trim();

    // Only normalize email if it's actually an email (contains @)
    if (str.includes('@') && validator.isEmail(str)) {
      str = validator.normalizeEmail(str) || str;
    }

    return str;
  }
}
