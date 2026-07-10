import { Mail, Phone } from "lucide-react";
import { siteConfig } from "@/lib/content/site-config";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-3 gap-y-3 px-4 py-8 text-base text-primary-foreground/80 sm:px-6 lg:flex-nowrap lg:justify-start lg:px-8">
        <span className="font-heading text-lg font-semibold whitespace-nowrap text-primary-foreground">
          {siteConfig.name}
        </span>
        <span aria-hidden="true" className="text-primary-foreground/30">
          |
        </span>
        <span className="whitespace-nowrap">
          Școală teologică evanghelică protestantă conservatoare
        </span>
        <span aria-hidden="true" className="text-primary-foreground/30">
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
        <span aria-hidden="true" className="text-primary-foreground/30">
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
      </div>

      <div className="border-t border-primary-foreground/10 py-4 text-center text-xs text-primary-foreground/60">
        © {year} {siteConfig.name}. Toate drepturile rezervate.
      </div>
    </footer>
  );
}
