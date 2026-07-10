import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";

interface ContentSectionProps {
  heading: string;
  summary: string;
  href: string;
  linkLabel?: string;
  icon?: LucideIcon;
}

export function ContentSection({
  heading,
  summary,
  href,
  linkLabel = "Citește mai mult",
  icon: Icon,
}: ContentSectionProps) {
  return (
    <Link
      href={href}
      className="group block rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
    >
      {Icon && (
        <span className="flex size-11 items-center justify-center rounded-full bg-secondary/15 text-secondary-foreground">
          <Icon className="size-5" aria-hidden="true" />
        </span>
      )}
      <h3 className="mt-4 font-heading text-xl font-semibold text-foreground">
        {heading}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {summary}
      </p>
      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
        {linkLabel}
        <ArrowRight
          className="size-4 transition-transform duration-200 group-hover:translate-x-1"
          aria-hidden="true"
        />
      </span>
    </Link>
  );
}
