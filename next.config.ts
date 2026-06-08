import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// Origin of the backend API, so the CSP can allow XHR/fetch to it while still
// blocking every other destination. Derived from the same env the app uses.
const apiOrigin = (() => {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!raw) return "";
  try {
    return new URL(raw).origin;
  } catch {
    return "";
  }
})();

// Origin where message attachments live (S3 bucket). Needed so the app can
// fetch/download files, preview PDFs in an iframe, and play videos. Override via
// NEXT_PUBLIC_MEDIA_BASE_URL; defaults to the current S3 bucket. Scoped to this
// one origin (not a blanket `https:`) so the connect-src token protection holds.
const mediaOrigin = (() => {
  const raw = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;
  if (raw) {
    try {
      return new URL(raw).origin;
    } catch {
      /* fall through to default */
    }
  }
  return "https://inhouse-panels.s3.ap-south-1.amazonaws.com";
})();

// Content-Security-Policy. The high-value protection for our setup (access token
// in sessionStorage) is `connect-src`: even if an XSS script slipped past
// DOMPurify, this blocks it from exfiltrating the token to any origin other
// than our own API. `object-src`/`base-uri`/`frame-ancestors`/`form-action`
// close the other common injection and clickjacking vectors.
//
// `script-src`/`style-src` keep `'unsafe-inline'` because Radix UI applies
// inline style attributes for positioning and Next injects inline bootstrap
// scripts; a stricter script policy would require per-request nonces and forcing
// every page into dynamic rendering. The token's exfiltration path is shut
// regardless, which is what matters here.
const csp = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' blob: data: https:`,
  `font-src 'self' data:`,
  `media-src 'self' blob: data: ${mediaOrigin}`,
  `connect-src 'self'${apiOrigin ? ` ${apiOrigin}` : ""} ${mediaOrigin}${isDev ? " ws: wss:" : ""}`,
  // Attachment previews (PDF) load in an <iframe> from the media bucket.
  `frame-src 'self' blob: ${mediaOrigin}`,
  `object-src 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `frame-ancestors 'none'`,
  // Only force HTTPS in production; on http://localhost this would break dev.
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  // Ignored by browsers over plain http (e.g. localhost), enforced over HTTPS.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
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
