import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center sm:px-6 lg:px-8">
      <p className="font-heading text-6xl font-semibold text-primary">404</p>
      <h1 className="mt-4 font-heading text-2xl font-semibold text-foreground">
        Pagina nu a fost găsită
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Pagina pe care o cauți nu există sau a fost mutată.
      </p>
      <Button className="mt-6" nativeButton={false} render={<Link href="/" />}>
        Înapoi la pagina principală
      </Button>
    </div>
  );
}
