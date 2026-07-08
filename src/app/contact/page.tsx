import type { Metadata } from "next";
import { PageHeader } from "@/components/sections/page-header";
import { ContactForm } from "@/components/contact/contact-form";
import { siteConfig } from "@/lib/content/site-config";

export const metadata: Metadata = { title: "Contact" };

export default function Page() {
  return (
    <>
      <PageHeader title="Contact" description="Ne poți scrie sau suna oricând." />
      <div className="mx-auto grid max-w-4xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="space-y-4">
          <h2 className="font-heading text-lg font-semibold text-foreground">
            Date de contact
          </h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {siteConfig.contact.phones.map((phone) => (
              <li key={phone}>
                <a href={`tel:${phone.replace(/\./g, "")}`} className="hover:text-primary">
                  {phone}
                </a>
              </li>
            ))}
            <li>
              <a href={`mailto:${siteConfig.contact.email}`} className="hover:text-primary">
                {siteConfig.contact.email}
              </a>
            </li>
          </ul>
        </div>
        <ContactForm />
      </div>
    </>
  );
}
