import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// 'unsafe-inline' la script-src e cerut de runtime-ul Next.js (fără nonce-uri pe site static);
// 'unsafe-eval' doar în dev (React Fast Refresh). Galeria foto e servită same-origin (nginx),
// nu mai e nevoie de excepții externe la img-src/media-src (Vercel Blob abandonat).
// challenges.cloudflare.com — widget-ul Turnstile (anti-bot pe login admin/student): script +
// iframe (frame-src), fără el widget-ul nu se randează/verifică.
// *.i.posthog.com — SDK-ul PostHog (error tracking + pageview cookieless): script (config.js,
// exception-autocapture.js de pe eu-assets) + connect (ingestie evenimente pe eu.i.posthog.com).
// e.seminarulteologicfiladelfia.ro — reverse proxy PostHog (nginx pe VPS, 2026-08-19): client-ul
// trimite tot prin domeniul propriu (api_host), nu direct pe eu.i.posthog.com — vezi docs/deploy.md.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://eu-assets.i.posthog.com https://e.seminarulteologicfiladelfia.ro${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self' https://challenges.cloudflare.com https://eu.i.posthog.com https://eu-assets.i.posthog.com https://e.seminarulteologicfiladelfia.ro",
  "frame-src https://challenges.cloudflare.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
];

const nextConfig: NextConfig = {
  // Fără `X-Powered-By: Next.js` — nu ajută pe nimeni în afară de un atacator care caută
  // ținte după stack (information disclosure, categoria 05 din Audit_checklist).
  poweredByHeader: false,
  experimental: {
    serverActions: {
      // Implicit 1MB — prea mic pentru materiale de curs (PDF/documente).
      bodySizeLimit: "50mb",
    },
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
