import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import heroImage from "../../../public/images/hero.jpg";

interface HeroProps {
  title: string;
  subtitle: string;
  ctaLabel?: string;
  ctaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
}

export function Hero({
  title,
  subtitle,
  ctaLabel,
  ctaHref,
  secondaryCtaLabel,
  secondaryCtaHref,
}: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-primary text-primary-foreground">
      <div aria-hidden="true" className="absolute inset-0">
        <Image
          src={heroImage}
          alt=""
          fill
          priority
          sizes="100vw"
          placeholder="blur"
          className="object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/40 via-primary/60 to-primary" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-primary/25" />
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="hero-blob hero-blob-a absolute -left-24 -top-32 size-[28rem] rounded-full bg-secondary/25 blur-3xl" />
        <div className="hero-blob hero-blob-b absolute -right-32 top-1/3 size-[24rem] rounded-full bg-secondary/15 blur-3xl" />
        <div className="hero-blob hero-blob-c absolute bottom-[-10rem] left-1/3 size-[26rem] rounded-full bg-primary-foreground/10 blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 sm:py-28 lg:px-8">
        <h1 className="font-heading text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base text-primary-foreground/85 sm:text-lg">
          {subtitle}
        </p>
        {(ctaLabel && ctaHref) || (secondaryCtaLabel && secondaryCtaHref) ? (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {ctaLabel && ctaHref && (
              <Button
                size="lg"
                nativeButton={false}
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
                render={<Link href={ctaHref} />}
              >
                {ctaLabel}
              </Button>
            )}
            {secondaryCtaLabel && secondaryCtaHref && (
              <Button
                size="lg"
                variant="outline"
                nativeButton={false}
                className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                render={<Link href={secondaryCtaHref} />}
              >
                {secondaryCtaLabel}
              </Button>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}
