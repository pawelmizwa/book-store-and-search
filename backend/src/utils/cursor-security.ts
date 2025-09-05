import { createHmac, timingSafeEqual } from 'crypto';

interface CursorData {
  created_at: string;
  id: number;
}

interface SignedCursor {
  data: CursorData;
  signature: string;
  timestamp: number;
}

export class CursorSecurity {
  private readonly secret: string;
  private readonly maxAge: number = 24 * 60 * 60 * 1000; // 24 hours

  constructor(secret?: string) {
    this.secret = secret || process.env.CURSOR_SECRET || 'default-secret-change-in-production';
    if (this.secret === 'default-secret-change-in-production') {
      console.warn('WARNING: Using default cursor secret. Set CURSOR_SECRET environment variable in production.');
    }
  }

  encodeCursor(data: CursorData): string {
    const timestamp = Date.now();
    const payload = JSON.stringify({ data, timestamp });
    const signature = this.createSignature(payload);
    
    const signedCursor: SignedCursor = {
      data,
      signature,
      timestamp
    };
    
    return Buffer.from(JSON.stringify(signedCursor)).toString('base64');
  }

  decodeCursor(cursor: string): CursorData {
    try {
      const decoded = Buffer.from(cursor, 'base64').toString('utf-8');
      const signedCursor: SignedCursor = JSON.parse(decoded);

      // Validate structure
      if (!signedCursor.data || !signedCursor.signature || !signedCursor.timestamp) {
        throw new Error('Invalid cursor structure');
      }

      // Check age
      if (Date.now() - signedCursor.timestamp > this.maxAge) {
        throw new Error('Cursor has expired');
      }

      // Verify signature
      const payload = JSON.stringify({ 
        data: signedCursor.data, 
        timestamp: signedCursor.timestamp 
      });
      const expectedSignature = this.createSignature(payload);
      
      if (!this.verifySignature(signedCursor.signature, expectedSignature)) {
        throw new Error('Invalid cursor signature');
      }

      // Validate data structure
      if (!signedCursor.data.created_at || typeof signedCursor.data.id !== 'number') {
        throw new Error('Invalid cursor data format');
      }

      return signedCursor.data;
    } catch (error) {
      throw new Error(`Invalid cursor: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private createSignature(payload: string): string {
    return createHmac('sha256', this.secret)
      .update(payload)
      .digest('hex');
  }

  private verifySignature(provided: string, expected: string): boolean {
    if (provided.length !== expected.length) {
      return false;
    }
    
    const providedBuffer = Buffer.from(provided, 'hex');
    const expectedBuffer = Buffer.from(expected, 'hex');
    
    return timingSafeEqual(providedBuffer, expectedBuffer);
  }
}
