"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

// Afișat o singură dată per browser (prima intrare pe site): apare după 5s, se închide singur
// după încă 12s sau manual din X.
// Anunț temporar — se scoate pe 31.10.2026 comentând <AnnouncementPopup /> din
// (site)/layout.tsx; componenta rămâne în cod pentru anunțuri viitoare (schimbă afișul + SEEN_KEY).
const SEEN_KEY = "anunt-inceperea-cursurilor-vazut";
const SHOW_DELAY_MS = 5000;
const AUTO_CLOSE_MS = 12000;

export function AnnouncementPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(SEEN_KEY)) return;
    } catch {
      return; // stocare blocată de browser — sărim peste popup, nu stricăm pagina
    }
    let closeTimer: ReturnType<typeof setTimeout> | undefined;
    const showTimer = setTimeout(() => {
      setOpen(true);
      localStorage.setItem(SEEN_KEY, "1");
      closeTimer = setTimeout(() => setOpen(false), AUTO_CLOSE_MS);
    }, SHOW_DELAY_MS);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(closeTimer);
    };
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Lățime explicită (nu w-auto): conținutul e poziționat cu left-1/2, iar w-auto îl
          limita la 50% din ecran — pe mobil afișul ieșea mic. Lățime = tot ecranul minus o
          margine mică, dar nu mai mult decât permite înălțimea (afiș 2:3, max 85vh). */}
      <DialogContent className="w-[min(calc(100vw-1rem),calc((85vh-1rem)*2/3))] max-w-none bg-background p-1 sm:max-w-none sm:p-2">
        <DialogTitle className="sr-only">Începerea cursurilor</DialogTitle>
        <Image
          src="/images/anunt-inceperea-cursurilor.jpg"
          alt="Începerea cursurilor la Seminarul Teologic Filadelfia din Petroșani — începând cu 17.10.2026, la ora 9.00"
          width={1024}
          height={1536}
          priority
          className="h-auto w-full rounded-lg"
        />
      </DialogContent>
    </Dialog>
  );
}
