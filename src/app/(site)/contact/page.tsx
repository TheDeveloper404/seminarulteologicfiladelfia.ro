import type { Metadata } from "next";
import { Mail, Phone } from "lucide-react";
import { PageHeader } from "@/components/sections/page-header";
import { ContactForm } from "@/components/contact/contact-form";
import { siteConfig } from "@/lib/content/site-config";

export const metadata: Metadata = { title: "Contact" };

export default function Page() {
  return (
    <>
      <PageHeader title="Contact" description="Ne poți scrie sau suna oricând." />
      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-5 lg:px-8">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm lg:col-span-2 lg:p-8">
          <h2 className="font-heading text-lg font-semibold text-foreground">
            Date de contact
          </h2>
          <ul className="mt-6 space-y-5 text-sm text-muted-foreground">
            {siteConfig.contact.phones.map((phone) => (
              <li key={phone} className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary/15 text-secondary-foreground">
                  <Phone className="size-4" />
                </span>
                <a href={`tel:${phone.replace(/\./g, "")}`} className="hover:text-primary">
                  {phone}
                </a>
              </li>
            ))}
            <li className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary/15 text-secondary-foreground">
                <Mail className="size-4" />
              </span>
              <a href={`mailto:${siteConfig.contact.email}`} className="hover:text-primary">
                {siteConfig.contact.email}
              </a>
            </li>
          </ul>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm lg:col-span-3 lg:p-8">
          <h2 className="font-heading text-lg font-semibold text-foreground">
            Trimite-ne un mesaj
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Completează formularul de mai jos și îți răspundem cât mai curând.
          </p>
          <div className="mt-6">
            <ContactForm />
          </div>
        </div>
      </div>
    </>
  );
}
