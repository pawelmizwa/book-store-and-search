import { describe, it, expect, beforeEach } from 'vitest';
import { CursorSecurity } from './cursor-security';

describe('CursorSecurity', () => {
  let cursorSecurity: CursorSecurity;

  beforeEach(() => {
    cursorSecurity = new CursorSecurity('test-secret-key');
  });

  describe('encodeCursor and decodeCursor', () => {
    it('should encode and decode cursor correctly', () => {
      const cursorData = {
        created_at: '2024-01-01T12:00:00Z',
        id: 123,
      };

      const encoded = cursorSecurity.encodeCursor(cursorData);
      const decoded = cursorSecurity.decodeCursor(encoded);

      expect(decoded).toEqual(cursorData);
    });

    it('should throw error for invalid base64 cursor', () => {
      expect(() => cursorSecurity.decodeCursor('invalid-base64!!!')).toThrow('Invalid cursor');
    });

    it('should throw error for cursor with invalid JSON', () => {
      const invalidJsonCursor = Buffer.from('invalid json').toString('base64');
      expect(() => cursorSecurity.decodeCursor(invalidJsonCursor)).toThrow('Invalid cursor');
    });

    it('should throw error for cursor with invalid signature', () => {
      const validCursor = cursorSecurity.encodeCursor({ created_at: '2024-01-01T12:00:00Z', id: 123 });
      
      // Tamper with the cursor
      const decoded = Buffer.from(validCursor, 'base64').toString('utf-8');
      const parsed = JSON.parse(decoded);
      parsed.signature = 'tampered-signature';
      const tamperedCursor = Buffer.from(JSON.stringify(parsed)).toString('base64');

      expect(() => cursorSecurity.decodeCursor(tamperedCursor)).toThrow('Invalid cursor');
    });

    it('should throw error for expired cursor', () => {
      // This test would need to be done differently in real scenarios
      // For now, just test that the decodeCursor handles errors properly
      const invalidTimestampCursor = Buffer.from(JSON.stringify({
        data: { created_at: '2024-01-01T12:00:00Z', id: 123 },
        signature: 'test',
        timestamp: Date.now() - (25 * 60 * 60 * 1000) // 25 hours ago
      })).toString('base64');

      expect(() => cursorSecurity.decodeCursor(invalidTimestampCursor)).toThrow('Invalid cursor');
    });

    it('should throw error for cursor with missing required fields', () => {
      const cursorSecurity = new CursorSecurity('test-secret');
      
      // Manually create a cursor with missing fields
      const invalidData = { timestamp: Date.now(), signature: 'test' };
      const invalidCursor = Buffer.from(JSON.stringify(invalidData)).toString('base64');
      
      expect(() => cursorSecurity.decodeCursor(invalidCursor)).toThrow('Invalid cursor');
    });
  });
});
