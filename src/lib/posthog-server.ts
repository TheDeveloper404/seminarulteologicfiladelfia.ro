import { PostHog } from "posthog-node";

let client: PostHog | null = null;

export function getPostHogServer(): PostHog | null {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return null;

  if (!client) {
    client = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com",
      flushAt: 1,
      flushInterval: 0,
    });
  }

  return client;
}

// Eveniment anonim de pe server: fara distinctId (posthog-node pune un uuid aleator si nu creeaza
// persoana), fara geoip. Proprietatile nu contin niciodata nume, email, ID sau IP.
export function trackEvent(event: string, properties?: Record<string, string>): void {
  getPostHogServer()?.capture({ event, properties, disableGeoip: true });
}
