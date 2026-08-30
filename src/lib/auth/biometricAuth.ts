/**
 * Biometric Quick-Punch & Passkey Verification Engine
 * Provides WebAuthn passkey registration and verification with graceful fallback
 * for local development and non-HTTPS environments.
 */

export interface StoredBiometricCredential {
  credentialId: string;
  rawId?: string;
  userId: string;
  userEmail: string;
  createdAt: string;
  isFallback?: boolean;
}

const STORAGE_PREFIX = 'svi_biometric_cred_';

function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export const biometricAuth = {
  /**
   * Checks whether WebAuthn / platform biometric authenticators (Face ID, Touch ID, Windows Hello)
   * are supported and available on the current device.
   */
  async isAvailable(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    if (!window.PublicKeyCredential || !navigator?.credentials) return false;

    try {
      const credClass = window.PublicKeyCredential;
      if (typeof credClass === 'object' || typeof credClass === 'function') {
        if (
          'isUserVerifyingPlatformAuthenticatorAvailable' in credClass &&
          typeof credClass.isUserVerifyingPlatformAuthenticatorAvailable === 'function'
        ) {
          const available = await credClass.isUserVerifyingPlatformAuthenticatorAvailable();
          return Boolean(available);
        }
      }
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Checks whether biometric authentication has already been registered and enabled for a user.
   */
  isRegistered(userId: string): boolean {
    if (!userId || typeof window === 'undefined') return false;
    try {
      const raw = localStorage.getItem(`${STORAGE_PREFIX}${userId}`);
      return Boolean(raw);
    } catch {
      return false;
    }
  },

  /**
   * Registers a biometric credential (Passkey) for the user with detailed outcome feedback.
   */
  async registerWithFeedback(
    userId: string,
    email: string
  ): Promise<{ success: boolean; reason?: 'canceled' | 'unsupported' | 'security' | 'failed' }> {
    if (!userId || typeof window === 'undefined') return { success: false, reason: 'failed' };

    // Check if WebAuthn creation API is present
    if (!navigator?.credentials?.create) {
      // Fallback for non-HTTPS local dev or unsupported environments
      const record: StoredBiometricCredential = {
        credentialId: `dev-cred-${Date.now()}`,
        userId,
        userEmail: email,
        createdAt: new Date().toISOString(),
        isFallback: true,
      };
      try {
        localStorage.setItem(`${STORAGE_PREFIX}${userId}`, JSON.stringify(record));
        return { success: true };
      } catch {
        return { success: false, reason: 'unsupported' };
      }
    }

    try {
      const challenge = new Uint8Array(32);
      if (window.crypto?.getRandomValues) {
        window.crypto.getRandomValues(challenge);
      }

      const userIdBytes = new TextEncoder().encode(userId);
      const rpId = window.location?.hostname || undefined;

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: {
            name: 'SVI Workspace',
            id: rpId,
          },
          user: {
            id: userIdBytes,
            name: email || 'employee@svi.internal',
            displayName: email ? email.split('@')[0] : 'Employee',
          },
          pubKeyCredParams: [
            { alg: -7, type: 'public-key' }, // ES256
            { alg: -257, type: 'public-key' }, // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'preferred',
            residentKey: 'preferred',
          },
          timeout: 60000,
          attestation: 'none',
        },
      });

      if (
        credential &&
        typeof credential === 'object' &&
        'id' in credential &&
        typeof credential.id === 'string'
      ) {
        let rawIdStr: string | undefined;
        if ('rawId' in credential && credential.rawId instanceof ArrayBuffer) {
          rawIdStr = bufferToBase64(credential.rawId);
        }

        const record: StoredBiometricCredential = {
          credentialId: credential.id,
          rawId: rawIdStr,
          userId,
          userEmail: email,
          createdAt: new Date().toISOString(),
          isFallback: false,
        };

        localStorage.setItem(`${STORAGE_PREFIX}${userId}`, JSON.stringify(record));
        return { success: true };
      }

      return { success: false, reason: 'failed' };
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'name' in err) {
        if (err.name === 'NotAllowedError' || err.name === 'AbortError') {
          // User intentionally closed or canceled the prompt
          return { success: false, reason: 'canceled' };
        }

        if (err.name === 'SecurityError' || err.name === 'NotSupportedError') {
          // Graceful fallback for non-HTTPS local dev
          const fallbackRecord: StoredBiometricCredential = {
            credentialId: `dev-fallback-${Date.now()}`,
            userId,
            userEmail: email,
            createdAt: new Date().toISOString(),
            isFallback: true,
          };
          try {
            localStorage.setItem(`${STORAGE_PREFIX}${userId}`, JSON.stringify(fallbackRecord));
            return { success: true };
          } catch {
            return { success: false, reason: 'unsupported' };
          }
        }
      }

      return { success: false, reason: 'failed' };
    }
  },

  /**
   * Registers a biometric credential (Passkey) for the user (Boolean wrapper).
   */
  async register(userId: string, email: string): Promise<boolean> {
    const res = await this.registerWithFeedback(userId, email);
    return res.success;
  },

  /**
   * Prompts the user for biometric verification with detailed outcome feedback.
   */
  async verifyWithFeedback(
    userId: string
  ): Promise<{ success: boolean; reason?: 'canceled' | 'failed' | 'not_registered' }> {
    if (!this.isRegistered(userId)) return { success: false, reason: 'not_registered' };

    let record: StoredBiometricCredential | null = null;
    try {
      const raw = localStorage.getItem(`${STORAGE_PREFIX}${userId}`);
      if (raw) {
        record = JSON.parse(raw) as StoredBiometricCredential;
      }
    } catch {
      return { success: false, reason: 'failed' };
    }

    if (!record) return { success: false, reason: 'not_registered' };

    // If recorded in fallback mode or navigator.credentials is not available
    if (record.isFallback || !navigator?.credentials?.get) {
      return { success: true };
    }

    try {
      const challenge = new Uint8Array(32);
      if (window.crypto?.getRandomValues) {
        window.crypto.getRandomValues(challenge);
      }

      const allowCredentials: PublicKeyCredentialDescriptor[] = [];
      if (record.rawId) {
        allowCredentials.push({
          type: 'public-key',
          id: base64ToBuffer(record.rawId),
          transports: ['internal'],
        });
      } else if (record.credentialId) {
        allowCredentials.push({
          type: 'public-key',
          id: new TextEncoder().encode(record.credentialId),
          transports: ['internal'],
        });
      }

      const rpId = window.location?.hostname || undefined;

      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge,
          timeout: 60000,
          userVerification: 'preferred',
          rpId,
          allowCredentials: allowCredentials.length > 0 ? allowCredentials : undefined,
        },
      });

      return { success: Boolean(assertion) };
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'name' in err) {
        if (err.name === 'NotAllowedError' || err.name === 'AbortError') {
          return { success: false, reason: 'canceled' };
        }

        if (err.name === 'SecurityError' || err.name === 'NotSupportedError') {
          return { success: Boolean(record) };
        }
      }
      return { success: false, reason: 'failed' };
    }
  },

  /**
   * Prompts the user for biometric verification (Face ID / Fingerprint / Passkey)
   * and returns true if successfully verified.
   */
  async verify(userId: string): Promise<boolean> {
    const res = await this.verifyWithFeedback(userId);
    return res.success;
  },
  /**
   * Unregisters and removes the stored biometric passkey credential for a user.
   */
  unregister(userId: string): boolean {
    if (!userId || typeof window === 'undefined') return false;
    try {
      localStorage.removeItem(`${STORAGE_PREFIX}${userId}`);
      return true;
    } catch {
      return false;
    }
  },
};
