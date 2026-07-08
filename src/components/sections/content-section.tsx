import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface ContentSectionProps {
  heading: string;
  summary: string;
  href: string;
  linkLabel?: string;
}

export function ContentSection({
  heading,
  summary,
  href,
  linkLabel = "Citește mai mult",
}: ContentSectionProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
      <h3 className="font-heading text-xl font-semibold text-foreground">
        {heading}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {summary}
      </p>
      <Link
        href={href}
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
      >
        {linkLabel}
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </div>
  );
}
