import { Mail, Phone } from "lucide-react";
import { siteConfig } from "@/lib/content/site-config";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-3 gap-y-3 px-4 py-8 text-center text-base text-primary-foreground/80 sm:px-6 lg:flex-nowrap lg:justify-start lg:px-8 lg:text-left">
        <span className="font-heading text-lg font-semibold whitespace-nowrap text-primary-foreground">
          {siteConfig.name}
        </span>
        <span aria-hidden="true" className="hidden text-primary-foreground/30 sm:inline">
          |
        </span>
        <span>Școală teologică evanghelică protestantă conservatoare</span>
        <span aria-hidden="true" className="hidden text-primary-foreground/30 sm:inline">
          |
        </span>
        <span className="whitespace-nowrap">
          Parte din{" "}
          <a
            href={siteConfig.parentChurch.url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-secondary underline-offset-4 hover:text-secondary"
          >
            {siteConfig.parentChurch.name}
          </a>
        </span>
        <span aria-hidden="true" className="hidden text-primary-foreground/30 sm:inline">
          |
        </span>
        <span className="whitespace-nowrap">Contact</span>

        <div className="group relative">
          <span className="flex size-10 items-center justify-center rounded-full bg-primary-foreground/10 text-primary-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground">
            <Phone className="size-4" />
          </span>
          <div className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 w-max -translate-x-1/2 scale-95 space-y-1 rounded-lg border border-primary-foreground/10 bg-popover px-3 py-2 text-sm text-popover-foreground opacity-0 shadow-lg transition-all group-hover:pointer-events-auto group-hover:scale-100 group-hover:opacity-100">
            {siteConfig.contact.phones.map((phone) => (
              <a
                key={phone}
                href={`tel:${phone.replace(/\./g, "")}`}
                className="block hover:text-primary"
              >
                {phone}
              </a>
            ))}
          </div>
        </div>

        <div className="group relative">
          <span className="flex size-10 items-center justify-center rounded-full bg-primary-foreground/10 text-primary-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground">
            <Mail className="size-4" />
          </span>
          <div className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 w-max -translate-x-1/2 scale-95 rounded-lg border border-primary-foreground/10 bg-popover px-3 py-2 text-sm text-popover-foreground opacity-0 shadow-lg transition-all group-hover:pointer-events-auto group-hover:scale-100 group-hover:opacity-100">
            <a href={`mailto:${siteConfig.contact.email}`} className="hover:text-primary">
              {siteConfig.contact.email}
            </a>
          </div>
        </div>

        <a
          href="https://www.facebook.com/seminarulteologicpenticostal.filadelfia/?locale=ro_RO"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
          className="flex size-10 items-center justify-center rounded-full bg-primary-foreground/10 text-primary-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground"
        >
          {/* lucide-react v1 nu mai are iconițe de brand — logo Facebook din Simple Icons (CC0) */}
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="size-4">
            <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
          </svg>
        </a>
      </div>

      <div className="border-t border-primary-foreground/10 py-4 text-center text-xs text-primary-foreground/60">
        © {year} {siteConfig.name}. Toate drepturile rezervate.
      </div>
    </footer>
  );
}
