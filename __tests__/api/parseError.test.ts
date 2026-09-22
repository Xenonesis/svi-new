import { describe, it, expect } from 'vitest';
import { extractApiErrorMessage } from '@/src/lib/api/parseError';

describe('extractApiErrorMessage', () => {
  it('should return plain string error as is', () => {
    expect(extractApiErrorMessage('Invalid password length')).toBe('Invalid password length');
  });

  it('should extract message from standard Error instance', () => {
    const error = new Error('Database connection failed');
    expect(extractApiErrorMessage(error)).toBe('Database connection failed');
  });

  it('should extract message from nested API error object { error: { message: "..." } }', () => {
    const apiResponse = {
      error: {
        code: 'BAD_REQUEST',
        message:
          'The SVI Email Address "sviinfrasolutions@gmail.cor" is invalid. Please check for typos (e.g. .com).',
      },
    };
    expect(extractApiErrorMessage(apiResponse)).toBe(
      'The SVI Email Address "sviinfrasolutions@gmail.cor" is invalid. Please check for typos (e.g. .com).'
    );
  });

  it('should never return "[object Object]" when given an object', () => {
    const nestedObj = { error: { code: 'UNKNOWN' } };
    const result = extractApiErrorMessage(nestedObj);
    expect(result).not.toBe('[object Object]');
    expect(result).toBe('An unexpected error occurred. Please try again.');
  });

  it('should format validation details cleanly when details array is provided', () => {
    const zodError = {
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: [
          { path: ['email'], message: 'Invalid email format' },
          { path: ['password'], message: 'Password too short' },
        ],
      },
    };
    const result = extractApiErrorMessage(zodError);
    expect(result).toContain('Validation failed');
    expect(result).toContain('Field "email": Invalid email format');
    expect(result).toContain('Field "password": Password too short');
  });

  it('should handle { message: "..." } format', () => {
    expect(extractApiErrorMessage({ message: 'User already exists' })).toBe('User already exists');
  });

  it('should handle { errors: [...] } array format', () => {
    const multiErrors = {
      errors: ['First name required', 'Phone number invalid'],
    };
    expect(extractApiErrorMessage(multiErrors)).toBe('First name required, Phone number invalid');
  });

  it('should return fallback message for null/undefined/empty input', () => {
    expect(extractApiErrorMessage(null, 'Custom fallback')).toBe('Custom fallback');
    expect(extractApiErrorMessage(undefined, 'Custom fallback')).toBe('Custom fallback');
    expect(extractApiErrorMessage('', 'Custom fallback')).toBe('Custom fallback');
  });

  describe('Database and Security Error Sanitization', () => {
    it('should translate permission denied and 42501 errors to friendly message', () => {
      const dbErr = { message: 'permission denied for view salary_structures' };
      expect(extractApiErrorMessage(dbErr)).toBe(
        'Access restricted: You do not have permission to perform this action. Please check your administrative privileges.'
      );
    });

    it('should translate row-level security policy violations', () => {
      const rlsErr = new Error('new row violates row-level security policy for table "profiles"');
      expect(extractApiErrorMessage(rlsErr)).toBe(
        'Access restricted: You do not have permission to perform this action. Please check your administrative privileges.'
      );
    });

    it('should translate JWT expired and session errors', () => {
      const jwtErr = { error: { message: 'JWT expired' } };
      expect(extractApiErrorMessage(jwtErr)).toBe(
        'Your session has expired. Please sign in again to continue.'
      );
    });

    it('should translate PGRST116 and 406 missing row errors', () => {
      const pgrstErr = { message: 'JSON object requested, multiple (or no) rows returned' };
      expect(extractApiErrorMessage(pgrstErr)).toBe(
        'The requested record was not found or has been modified. Please refresh and try again.'
      );
    });

    it('should translate unique constraint duplicate errors', () => {
      const dupErr = {
        message: 'duplicate key value violates unique constraint "idx_users_email"',
      };
      expect(extractApiErrorMessage(dupErr)).toBe(
        'A record with these details already exists. Please verify your input and avoid duplicate entries.'
      );
    });

    it('should translate foreign key dependency errors', () => {
      const fkErr = { message: 'update or delete on table violates foreign key constraint' };
      expect(extractApiErrorMessage(fkErr)).toBe(
        'This operation cannot be completed because other records in the system depend on this item.'
      );
    });

    it('should translate network failure errors', () => {
      const netErr = new TypeError('Failed to fetch');
      expect(extractApiErrorMessage(netErr)).toBe(
        'Unable to connect to the server. Please check your internet connection and try again.'
      );
    });
  });
});
