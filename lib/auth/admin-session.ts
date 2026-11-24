import crypto from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const SESSION_COOKIE_NAME = "cva_admin_session";
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || "cva_super_secure_admin_jwt_key_2026_99x7";

// Designated administrator email accounts
export const AUTHORIZED_ADMIN_EMAILS = [
  "paidimarriabhiram@gmail.com",
  "community.vaofficial@gmail.com",
  (process.env.ADMIN_EMAIL || "").toLowerCase().trim(),
].filter(Boolean);

export const ALLOWED_ADMIN_EMAIL = "paidimarriabhiram@gmail.com";

export function isAuthorizedAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  const normalized = email.toLowerCase().trim();
  return AUTHORIZED_ADMIN_EMAILS.includes(normalized);
}

interface AdminTokenPayload {
  email: string;
  role: "ADMIN";
  exp: number;
}

/**
 * Creates an HMAC-SHA256 signed session token for the admin member
 */
export function signAdminToken(email: string): string {
  const payload: AdminTokenPayload = {
    email: email.toLowerCase().trim(),
    role: "ADMIN",
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days validity
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(payloadB64)
    .digest("base64url");

  return `${payloadB64}.${signature}`;
}

/**
 * Validates the HMAC signature and expiration of an admin session token
 */
export function verifyAdminToken(token: string | undefined | null): { valid: boolean; email?: string } {
  if (!token) return { valid: false };

  try {
    const parts = token.split(".");
    if (parts.length !== 2) return { valid: false };

    const [payloadB64, signature] = parts;
    const expectedSig = crypto
      .createHmac("sha256", SESSION_SECRET)
      .update(payloadB64)
      .digest("base64url");

    if (signature !== expectedSig) return { valid: false };

    const payload: AdminTokenPayload = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf8")
    );

    if (Date.now() > payload.exp) return { valid: false };
    if (payload.role !== "ADMIN") return { valid: false };

    // Enforce authorized admin verification
    if (!isAuthorizedAdminEmail(payload.email)) {
      console.warn(`[Security Alert] Access denied for unauthorized admin attempt: ${payload.email}`);
      return { valid: false };
    }

    return { valid: true, email: payload.email };
  } catch {
    return { valid: false };
  }
}

/**
 * Attaches the httpOnly secure cookie to a NextResponse
 */
export function attachAdminSessionCookie(response: NextResponse, email: string): void {
  const token = signAdminToken(email);
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

/**
 * Clears the admin session cookie on logout
 */
export function clearAdminSessionCookie(response: NextResponse): void {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

/**
 * Helper to check admin session from Server Components / API handlers
 */
export async function isAuthenticatedAdminServer(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return verifyAdminToken(token).valid;
}
