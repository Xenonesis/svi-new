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
});
