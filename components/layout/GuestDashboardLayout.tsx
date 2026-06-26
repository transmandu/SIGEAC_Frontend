"use client";

import { cn } from "@/lib/utils";
import { useStore } from "@/hooks/helpers/use-store";
import { useGuestSidebarToggle } from "@/hooks/helpers/use-guest-sidebar-toggle";
import { GuestSidebar } from "./GuestSidebar";
import Footer from "./Footer";

export default function GuestDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sidebar = useStore(useGuestSidebarToggle, (state) => state);

  if (!sidebar) return null;

  const { isOpen } = sidebar;

  return (
    <>
      <GuestSidebar />

      <main
        className={cn(
          "min-h-[calc(100vh_-_56px)] transition-[margin-left] ease-in-out duration-300",
          isOpen === false ? "lg:ml-[90px]" : "lg:ml-72"
        )}
      >
        {children}
      </main>

      <footer
        className={cn(
          "transition-[margin-left] ease-in-out duration-300",
          isOpen === false ? "lg:ml-[90px]" : "lg:ml-72"
        )}
      >
        <Footer />
      </footer>
    </>
  );
}