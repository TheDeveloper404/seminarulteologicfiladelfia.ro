import Link from "next/link";
import { Button } from "@/components/ui/button";

interface HeroProps {
  title: string;
  subtitle: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export function Hero({ title, subtitle, ctaLabel, ctaHref }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-primary text-primary-foreground">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="max-w-2xl">
          <h1 className="font-heading text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
            {title}
          </h1>
          <p className="mt-6 text-base text-primary-foreground/85 sm:text-lg">
            {subtitle}
          </p>
          {ctaLabel && ctaHref && (
            <div className="mt-8">
              <Button
                size="lg"
                nativeButton={false}
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
                render={<Link href={ctaHref} />}
              >
                {ctaLabel}
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
