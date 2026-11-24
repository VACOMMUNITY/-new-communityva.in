import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE_NAME = "cva_admin_session";
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || "cva_super_secure_admin_jwt_key_2026_99x7";
const ALLOWED_ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "community.vaofficial@gmail.com").toLowerCase().trim();

// Web Crypto based HMAC-SHA256 verification (fully Edge & Node compatible)
async function verifyTokenEdge(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return false;
    const [payloadB64, signature] = parts;

    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(SESSION_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const sigBuffer = await crypto.subtle.sign("HMAC", key, enc.encode(payloadB64));
    
    // Convert ArrayBuffer to base64url
    const expectedSig = btoa(String.fromCharCode(...new Uint8Array(sigBuffer)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    if (signature !== expectedSig) return false;

    // Decode payload
    const decodedPayloadStr = atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(decodedPayloadStr);

    if (Date.now() > payload.exp) return false;
    if (payload.role !== "ADMIN") return false;
    if (payload.email !== ALLOWED_ADMIN_EMAIL) return false;

    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin and any sub-routes
  if (pathname.startsWith("/admin")) {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const isValid = await verifyTokenEdge(sessionCookie);

    if (!isValid) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      loginUrl.searchParams.set("error", "unauthorized_admin");
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect all /api/admin/* endpoints
  if (pathname.startsWith("/api/admin")) {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const isValid = await verifyTokenEdge(sessionCookie);

    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized: Admin privileges required for this action.",
        },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
