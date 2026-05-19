import { NextRequest, NextResponse } from "next/server";

// ── Geo-restriction ────────────────────────────────────────────────────────
// Only US and Canada can access checkout (ships to US/CA only).
// Vercel sets x-vercel-ip-country on every edge request.
// When the header is absent (local dev) we allow the request through.
const ALLOWED_COUNTRIES = new Set(["US", "CA"]);

// ── Rate limiting ─────────────────────────────────────────────────────────
// In-memory, best-effort — resets per Edge function instance lifecycle.
// For strict distributed rate limiting, swap this for Upstash Redis.
const RATE_LIMIT_MAX        = 20;   // requests
const RATE_LIMIT_WINDOW_MS  = 60_000; // per minute

const _ipMap = new Map<string, { n: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now   = Date.now();
  const entry = _ipMap.get(ip);

  if (!entry || now > entry.resetAt) {
    _ipMap.set(ip, { n: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true; // allowed
  }
  if (entry.n >= RATE_LIMIT_MAX) return false; // blocked
  entry.n++;
  return true;
}

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-vercel-forwarded-for") ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

// ── Middleware ────────────────────────────────────────────────────────────
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Rate-limit the payment intent creation API and confirm-order
  if (pathname.startsWith("/api/checkout") || pathname.startsWith("/api/confirm-order")) {
    if (!checkRateLimit(getClientIp(req))) {
      return new NextResponse(
        JSON.stringify({ error: "Too many requests. Please wait and try again." }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": "60",
          },
        }
      );
    }
  }

  // 2. Geo-restrict checkout page and payment API to US / CA
  const country = req.headers.get("x-vercel-ip-country") ?? "";
  if (country && !ALLOWED_COUNTRIES.has(country)) {
    if (pathname.startsWith("/api/")) {
      // For API routes return JSON 403
      return new NextResponse(
        JSON.stringify({ error: "Service not available in your region." }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }
    // For page routes redirect to a friendly message
    const url = req.nextUrl.clone();
    url.pathname = "/region-blocked";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Only run middleware on checkout-related paths
export const config = {
  matcher: ["/checkout/:path*", "/api/checkout/:path*", "/api/confirm-order/:path*"],
};
