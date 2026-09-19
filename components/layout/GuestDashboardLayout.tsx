"use client";

import { cn } from "@/lib/utils";
import { useGuestSidebarToggle } from "@/hooks/helpers/use-guest-sidebar-toggle";
import { GuestSidebar } from "./GuestSidebar";
import { GuestNavbar } from "./GuestNavbar";
import Footer from "./Footer";
import { PageTitleProvider } from "@/contexts/PageTitleContext";

export default function GuestDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isOpen = useGuestSidebarToggle((state) => state.isOpen);

  return (
    <PageTitleProvider>
      <GuestSidebar />

      <main
        className={cn(
          "min-h-[calc(100vh-56px)] transition-[margin-left] ease-in-out duration-300",
          isOpen === false ? "lg:ml-22.5" : "lg:ml-72"
        )}
      >
        <GuestNavbar />
        {children}
      </main>

      <footer
        className={cn(
          "transition-[margin-left] ease-in-out duration-300",
          isOpen === false ? "lg:ml-22.5" : "lg:ml-72"
        )}
      >
        <Footer />
      </footer>
    </PageTitleProvider>
  );
}
