"use client";

import Script from "next/script";

// Randat doar dacă NEXT_PUBLIC_TURNSTILE_SITE_KEY e setat — evită un widget stricat în dev local
// fără cont Cloudflare Turnstile configurat. Verificarea reală (server-side) e în
// src/lib/turnstile.ts, gated separat pe TURNSTILE_SECRET_KEY.
export function TurnstileWidget() {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  if (!siteKey) return null;

  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
      <div className="cf-turnstile" data-sitekey={siteKey} data-theme="light" />
    </>
  );
}
