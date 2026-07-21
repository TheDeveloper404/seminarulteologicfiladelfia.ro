"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PhotoItem {
  id: number;
  url: string;
}

interface LightboxProps {
  items: PhotoItem[];
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
            key={item.id}
            type="button"
            onClick={() => setOpenIndex(index)}
            className={cn(
              "relative aspect-square overflow-hidden rounded-lg bg-muted",
              "focus-visible:ring-3 focus-visible:ring-ring/50 outline-none"
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- vezi nota din gallery-card.tsx */}
            <img
              src={item.url}
              alt={`${albumTitle} — poza ${index + 1}`}
              className="size-full object-cover transition-transform hover:scale-105"
            />
          </button>
        ))}
      </div>

      <Dialog open={openIndex !== null} onOpenChange={(open) => !open && setOpenIndex(null)}>
        <DialogContent className="max-w-3xl bg-background p-2 sm:p-2">
          <DialogTitle className="sr-only">
            {albumTitle} — poza {openIndex !== null ? openIndex + 1 : ""}
          </DialogTitle>
          {active && (
            <div className="relative">
              <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-lg bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element -- vezi nota din gallery-card.tsx */}
                <img
                  src={active.url}
                  alt={`${albumTitle} — poza ${(openIndex ?? 0) + 1}`}
                  className="max-h-full max-w-full object-contain"
                />
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
