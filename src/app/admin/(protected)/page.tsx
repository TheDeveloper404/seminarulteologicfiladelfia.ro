import Link from "next/link";

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="font-heading text-xl font-semibold">Panou de control</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Prezență, plăți, materiale de curs și note — secțiunile apar pe măsură ce sunt
        implementate.
      </p>
      <Link href="/admin/studenti" className="mt-4 inline-block text-sm text-primary underline">
        Gestionare studenți
      </Link>
    </div>
  );
}
