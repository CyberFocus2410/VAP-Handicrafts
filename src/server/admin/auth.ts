/**
 * Admin Authentication & Cryptographic Session Security
 * Web Crypto API compliant for compatibility with Next.js Edge Middleware and Node API routes.
 */

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const DEFAULT_FALLBACK_SECRET = "vap-handicrafts-admin-secret-session-salt-2026";

function getSecret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.ADMIN_PASSWORD ||
    DEFAULT_FALLBACK_SECRET
  );
}

/**
 * Computes a SHA-256 hash using the Web Crypto API.
 */
async function computeHash(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Generates a tamper-proof cryptographic admin session token.
 * Format: `<timestamp>.<signature>`
 */
export async function createAdminSessionToken(): Promise<string> {
  const timestamp = Date.now().toString();
  const secret = getSecret();
  const signature = await computeHash(`${timestamp}:${secret}`);
  return `${timestamp}.${signature}`;
}

/**
 * Verifies whether an admin session token is cryptographically valid and unexpired.
 */
export async function verifyAdminSessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;

  // Development convenience fallback
  if (process.env.NODE_ENV !== "production" && token === "active") {
    return true;
  }

  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [timestampStr, signature] = parts;
  const timestamp = Number(timestampStr);

  if (isNaN(timestamp) || timestamp <= 0) return false;

  // Check expiration (7 days)
  if (Date.now() - timestamp > SESSION_TTL_MS) {
    return false;
  }

  // Prevent future timestamp manipulation
  if (timestamp > Date.now() + 60000) {
    return false;
  }

  const secret = getSecret();
  const expectedSignature = await computeHash(`${timestampStr}:${secret}`);

  return signature === expectedSignature;
}

// In-memory sliding rate limiter for login attempts (IP-based)
const loginAttempts = new Map<string, { count: number; lockedUntil: number }>();

export function checkLoginRateLimit(ip: string): { allowed: boolean; waitSeconds?: number } {
  const now = Date.now();
  const record = loginAttempts.get(ip);

  if (record && record.lockedUntil > now) {
    const waitSeconds = Math.ceil((record.lockedUntil - now) / 1000);
    return { allowed: false, waitSeconds };
  }

  return { allowed: true };
}

export function recordFailedLogin(ip: string): void {
  const now = Date.now();
  const record = loginAttempts.get(ip) || { count: 0, lockedUntil: 0 };
  record.count += 1;

  if (record.count >= 5) {
    // Lock out for 15 minutes after 5 consecutive failed attempts
    record.lockedUntil = now + 15 * 60 * 1000;
    record.count = 0;
  }

  loginAttempts.set(ip, record);
}

export function recordSuccessfulLogin(ip: string): void {
  loginAttempts.delete(ip);
}
