"use client";

import Script from "next/script";
import { useEffect, useId } from "react";

declare global {
  interface Window {
    // Callback-urile Turnstile trebuie să fie funcții globale simple (vezi docs Cloudflare) —
    // fiecare instanță a widget-ului își înregistrează aici propriile callback-uri, sub nume unice.
    [callbackName: `turnstileCb_${string}`]: ((...args: unknown[]) => void) | undefined;
  }
}

// Widget-ul se randează async (script încărcat pe rețea + challenge rulat de Cloudflare) — dacă
// userul dă submit înainte ca token-ul să fie gata, `cf-turnstile-response` e gol și serverul
// respinge cu "verificare antibot eșuată", deși parola era corectă (bug raportat 2026-07-21:
// funcționa abia după refresh, pentru că a doua oară widget-ul avea timp să se încarce din cache).
// Fix: `onReadyChange` anunță formularul-părinte când tokenul e valid, ca să poată dezactiva
// submit-ul până atunci.
export function TurnstileWidget({
  onReadyChange,
}: {
  onReadyChange?: (ready: boolean) => void;
}) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const rawId = useId().replace(/[^a-zA-Z0-9]/g, "");
  const successCallback = `turnstileCb_${rawId}_ok` as const;
  // expired-callback e apelat fără argumente; error-callback e apelat cu un cod de eroare
  // (truthy) — dacă am refolosi handler-ul de succes pentru amândouă, o eroare ar fi
  // interpretată greșit ca "token valid". Un singur handler comun, dedicat "nu e gata".
  const notReadyCallback = `turnstileCb_${rawId}_reset` as const;

  useEffect(() => {
    if (!siteKey) return;
    window[successCallback] = (token) => onReadyChange?.(!!token);
    window[notReadyCallback] = () => onReadyChange?.(false);
    return () => {
      delete window[successCallback];
      delete window[notReadyCallback];
    };
  }, [siteKey, successCallback, notReadyCallback, onReadyChange]);

  if (!siteKey) return null;

  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
      <div
        className="cf-turnstile"
        data-sitekey={siteKey}
        data-theme="light"
        data-callback={successCallback}
        data-expired-callback={notReadyCallback}
        data-error-callback={notReadyCallback}
      />
    </>
  );
}
