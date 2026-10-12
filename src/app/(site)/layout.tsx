import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AnnouncementPopup } from "@/components/announcement-popup";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <AnnouncementPopup />
    </div>
  );
}
