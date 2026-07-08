import Link from "next/link";
import { mainNav, siteConfig } from "@/lib/content/site-config";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div className="space-y-2">
          <p className="font-heading text-lg font-semibold">{siteConfig.name}</p>
          <p className="text-sm text-primary-foreground/80">
            {siteConfig.description}
          </p>
          <p className="pt-2 text-sm text-primary-foreground/80">
            Parte din{" "}
            <a
              href={siteConfig.parentChurch.url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-secondary underline-offset-4 hover:text-secondary"
            >
              {siteConfig.parentChurch.name}
            </a>
          </p>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-primary-foreground/60">
            Navigare rapidă
          </p>
          <ul className="grid grid-cols-2 gap-2 text-sm">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-primary-foreground/80 hover:text-secondary"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-primary-foreground/60">
            Contact
          </p>
          <ul className="space-y-1 text-sm text-primary-foreground/80">
            {siteConfig.contact.phones.map((phone) => (
              <li key={phone}>
                <a href={`tel:${phone.replace(/\./g, "")}`} className="hover:text-secondary">
                  {phone}
                </a>
              </li>
            ))}
            <li>
              <a
                href={`mailto:${siteConfig.contact.email}`}
                className="hover:text-secondary"
              >
                {siteConfig.contact.email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-primary-foreground/10 py-4 text-center text-xs text-primary-foreground/60">
        © {year} {siteConfig.name}. Toate drepturile rezervate.
      </div>
    </footer>
  );
}
