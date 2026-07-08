"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { MediaItem } from "@/lib/content/types";

interface LightboxProps {
  items: MediaItem[];
  albumTitle: string;
}

export function Lightbox({ items, albumTitle }: LightboxProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const showPrev = () =>
    setOpenIndex((i) => (i === null ? i : (i - 1 + items.length) % items.length));
  const showNext = () =>
    setOpenIndex((i) => (i === null ? i : (i + 1) % items.length));

  const active = openIndex !== null ? items[openIndex] : null;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item, index) => (
          <button
            key={item.url}
            type="button"
            onClick={() => setOpenIndex(index)}
            className={cn(
              "relative aspect-square overflow-hidden rounded-lg bg-muted",
              "focus-visible:ring-3 focus-visible:ring-ring/50 outline-none"
            )}
          >
            <Image
              src={item.thumbUrl ?? item.url}
              alt={item.alt}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              className="object-cover transition-transform hover:scale-105"
            />
          </button>
        ))}
      </div>

      <Dialog open={openIndex !== null} onOpenChange={(open) => !open && setOpenIndex(null)}>
        <DialogContent className="max-w-3xl bg-background p-2 sm:p-2">
          <DialogTitle className="sr-only">
            {albumTitle} — {active?.alt}
          </DialogTitle>
          {active && (
            <div className="relative">
              <div className="relative aspect-video overflow-hidden rounded-lg bg-black">
                {active.type === "image" ? (
                  <Image
                    src={active.url}
                    alt={active.alt}
                    fill
                    sizes="100vw"
                    className="object-contain"
                  />
                ) : (
                  <video
                    src={active.url}
                    controls
                    className="h-full w-full object-contain"
                  />
                )}
              </div>
              {items.length > 1 && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Imaginea anterioară"
                    onClick={showPrev}
                    className="absolute left-2 top-1/2 -translate-y-1/2"
                  >
                    <ChevronLeft />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Imaginea următoare"
                    onClick={showNext}
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                  >
                    <ChevronRight />
                  </Button>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
