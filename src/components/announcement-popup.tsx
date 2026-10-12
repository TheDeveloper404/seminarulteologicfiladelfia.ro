"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

// Afișat o singură dată per browser (prima intrare pe site), se închide singur după 12s
// sau manual din X.
const SEEN_KEY = "anunt-inceperea-cursurilor-vazut";
const AUTO_CLOSE_MS = 12000;

export function AnnouncementPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(SEEN_KEY)) return;
    localStorage.setItem(SEEN_KEY, "1");
    // localStorage există doar în browser, deci starea inițială nu se poate decide la render
    // (pe server) — un singur render în plus la montare, intenționat.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(true);
    const timer = setTimeout(() => setOpen(false), AUTO_CLOSE_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-auto bg-background p-2 sm:max-w-none sm:p-2">
        <DialogTitle className="sr-only">Începerea cursurilor</DialogTitle>
        <Image
          src="/images/anunt-inceperea-cursurilor.jpg"
          alt="Începerea cursurilor la Seminarul Teologic Filadelfia din Petroșani — începând cu 17.10.2026, la ora 9.00"
          width={1024}
          height={1536}
          priority
          className="h-auto max-h-[80vh] w-auto max-w-full rounded-lg"
        />
      </DialogContent>
    </Dialog>
  );
}
