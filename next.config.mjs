/** @type {import('next').NextConfig} */

const securityHeaders = [
  // Prevent MIME-type sniffing
  { key: "X-Content-Type-Options",    value: "nosniff" },
  // Disallow framing (clickjacking protection)
  { key: "X-Frame-Options",           value: "DENY" },
  // Legacy XSS filter (belt-and-suspenders)
  { key: "X-XSS-Protection",          value: "1; mode=block" },
  // HTTPS-only for 2 years, including subdomains
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Limit referrer info sent cross-origin
  { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
  // Deny access to sensitive browser APIs
  { key: "Permissions-Policy",        value: "camera=(), microphone=(), geolocation=(), payment=(self)" },
];

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
