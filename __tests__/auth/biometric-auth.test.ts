import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { biometricAuth } from '@/src/lib/auth/biometricAuth';

interface MockPublicKeyCredential {
  isUserVerifyingPlatformAuthenticatorAvailable?: () => Promise<boolean>;
}

function setWindowPublicKeyCredential(val: unknown): void {
  if (typeof window !== 'undefined') {
    Reflect.set(window, 'PublicKeyCredential', val);
  }
}

function getWindowPublicKeyCredential(): unknown {
  if (typeof window !== 'undefined') {
    return Reflect.get(window, 'PublicKeyCredential');
  }
  return undefined;
}

describe('Biometric Passkey Authentication', () => {
  const originalPublicKeyCredential = getWindowPublicKeyCredential();
  const originalCredentials = typeof navigator !== 'undefined' ? navigator.credentials : undefined;

  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    if (typeof window !== 'undefined') {
      setWindowPublicKeyCredential(originalPublicKeyCredential);
      Object.defineProperty(navigator, 'credentials', {
        value: originalCredentials,
        configurable: true,
        writable: true,
      });
    }
  });

  describe('isAvailable', () => {
    it('returns false when window.PublicKeyCredential is undefined', async () => {
      setWindowPublicKeyCredential(undefined);
      const available = await biometricAuth.isAvailable();
      expect(available).toBe(false);
    });

    it('returns true when window.PublicKeyCredential is present and platform authenticator is available', async () => {
      const mockCred: MockPublicKeyCredential = {
        isUserVerifyingPlatformAuthenticatorAvailable: vi.fn().mockResolvedValue(true),
      };
      setWindowPublicKeyCredential(mockCred);
      Object.defineProperty(navigator, 'credentials', {
        value: {
          create: vi.fn(),
          get: vi.fn(),
        },
        configurable: true,
        writable: true,
      });

      const available = await biometricAuth.isAvailable();
      expect(available).toBe(true);
    });

    it('returns false when platform authenticator is unavailable', async () => {
      const mockCred: MockPublicKeyCredential = {
        isUserVerifyingPlatformAuthenticatorAvailable: vi.fn().mockResolvedValue(false),
      };
      setWindowPublicKeyCredential(mockCred);
      Object.defineProperty(navigator, 'credentials', {
        value: {
          create: vi.fn(),
          get: vi.fn(),
        },
        configurable: true,
        writable: true,
      });

      const available = await biometricAuth.isAvailable();
      expect(available).toBe(false);
    });

    it('returns false when platform authenticator check throws', async () => {
      const mockCred: MockPublicKeyCredential = {
        isUserVerifyingPlatformAuthenticatorAvailable: vi
          .fn()
          .mockRejectedValue(new Error('Hardware fault')),
      };
      setWindowPublicKeyCredential(mockCred);
      Object.defineProperty(navigator, 'credentials', {
        value: { create: vi.fn(), get: vi.fn() },
        configurable: true,
        writable: true,
      });

      const available = await biometricAuth.isAvailable();
      expect(available).toBe(false);
    });
  });

  describe('isRegistered', () => {
    it('returns false when no credential is registered', () => {
      expect(biometricAuth.isRegistered('user-123')).toBe(false);
    });

    it('returns false for empty userId', () => {
      expect(biometricAuth.isRegistered('')).toBe(false);
    });

    it('returns true after a credential is registered', async () => {
      Object.defineProperty(navigator, 'credentials', {
        value: {
          create: vi.fn().mockResolvedValue({
            id: 'mock-cred-id-xyz',
            rawId: new Uint8Array([1, 2, 3, 4]).buffer,
            type: 'public-key',
          }),
        },
        configurable: true,
        writable: true,
      });

      await biometricAuth.register('user-456', 'employee@svi.internal');
      expect(biometricAuth.isRegistered('user-456')).toBe(true);
      expect(biometricAuth.isRegistered('other-user')).toBe(false);
    });
  });

  describe('register', () => {
    it('successfully registers credential via WebAuthn and stores it in localStorage', async () => {
      const mockCreate = vi.fn().mockResolvedValue({
        id: 'test-cred-id-abc',
        rawId: new Uint8Array([10, 20, 30]).buffer,
        type: 'public-key',
      });

      Object.defineProperty(navigator, 'credentials', {
        value: {
          create: mockCreate,
        },
        configurable: true,
        writable: true,
      });

      const result = await biometricAuth.register('user-123', 'john.doe@svi.internal');
      expect(result).toBe(true);
      expect(mockCreate).toHaveBeenCalledTimes(1);
      expect(biometricAuth.isRegistered('user-123')).toBe(true);
    });

    it('returns false when user cancels or rejects the biometric prompt (NotAllowedError)', async () => {
      const notAllowedErr = new Error('The operation either timed out or was not allowed');
      notAllowedErr.name = 'NotAllowedError';

      Object.defineProperty(navigator, 'credentials', {
        value: {
          create: vi.fn().mockRejectedValue(notAllowedErr),
        },
        configurable: true,
        writable: true,
      });

      const result = await biometricAuth.register('user-canceled', 'test@svi.internal');
      expect(result).toBe(false);
      expect(biometricAuth.isRegistered('user-canceled')).toBe(false);
    });

    it('falls back gracefully when WebAuthn throws SecurityError in non-HTTPS local dev', async () => {
      const securityErr = new Error('The operation is insecure');
      securityErr.name = 'SecurityError';

      Object.defineProperty(navigator, 'credentials', {
        value: {
          create: vi.fn().mockRejectedValue(securityErr),
        },
        configurable: true,
        writable: true,
      });

      const result = await biometricAuth.register('user-dev', 'dev@svi.internal');
      expect(result).toBe(true);
      expect(biometricAuth.isRegistered('user-dev')).toBe(true);
    });

    it('falls back gracefully when navigator.credentials is unavailable', async () => {
      Object.defineProperty(navigator, 'credentials', {
        value: undefined,
        configurable: true,
        writable: true,
      });

      const result = await biometricAuth.register('user-dev-no-creds', 'dev@svi.internal');
      expect(result).toBe(true);
      expect(biometricAuth.isRegistered('user-dev-no-creds')).toBe(true);
    });
  });

  describe('verify', () => {
    it('returns false when user is not registered', async () => {
      const verified = await biometricAuth.verify('unregistered-user');
      expect(verified).toBe(false);
    });

    it('returns true when WebAuthn assertion succeeds', async () => {
      const mockCreate = vi.fn().mockResolvedValue({
        id: 'cred-999',
        rawId: new Uint8Array([5, 6, 7]).buffer,
        type: 'public-key',
      });
      const mockGet = vi.fn().mockResolvedValue({
        id: 'cred-999',
        type: 'public-key',
      });

      Object.defineProperty(navigator, 'credentials', {
        value: {
          create: mockCreate,
          get: mockGet,
        },
        configurable: true,
        writable: true,
      });

      await biometricAuth.register('user-verified', 'emp@svi.internal');

      const verified = await biometricAuth.verify('user-verified');
      expect(verified).toBe(true);
      expect(mockGet).toHaveBeenCalledTimes(1);
    });

    it('returns false when user cancels assertion (NotAllowedError)', async () => {
      const notAllowedErr = new Error('User cancelled');
      notAllowedErr.name = 'NotAllowedError';

      Object.defineProperty(navigator, 'credentials', {
        value: {
          create: vi.fn().mockResolvedValue({
            id: 'cred-cancel',
            rawId: new Uint8Array([1]).buffer,
            type: 'public-key',
          }),
          get: vi.fn().mockRejectedValue(notAllowedErr),
        },
        configurable: true,
        writable: true,
      });

      await biometricAuth.register('user-cancels', 'cancel@svi.internal');

      const verified = await biometricAuth.verify('user-cancels');
      expect(verified).toBe(false);
    });

    it('verifies successfully for fallback credential in non-HTTPS dev', async () => {
      Object.defineProperty(navigator, 'credentials', {
        value: undefined,
        configurable: true,
        writable: true,
      });

      await biometricAuth.register('user-dev-fallback', 'fallback@svi.internal');
      const verified = await biometricAuth.verify('user-dev-fallback');
      expect(verified).toBe(true);
    });
  });

  describe('unregister', () => {
    it('removes registered credential and returns true', async () => {
      Object.defineProperty(navigator, 'credentials', {
        value: {
          create: vi.fn().mockResolvedValue({
            id: 'cred-del',
            rawId: new Uint8Array([9]).buffer,
            type: 'public-key',
          }),
        },
        configurable: true,
        writable: true,
      });

      await biometricAuth.register('user-to-remove', 'rem@svi.internal');
      expect(biometricAuth.isRegistered('user-to-remove')).toBe(true);

      const unregisterResult = biometricAuth.unregister('user-to-remove');
      expect(unregisterResult).toBe(true);
      expect(biometricAuth.isRegistered('user-to-remove')).toBe(false);
    });

    it('returns false when unregistering with empty userId', () => {
      expect(biometricAuth.unregister('')).toBe(false);
    });
  });
});
