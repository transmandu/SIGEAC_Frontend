"use client";

import { cn } from "@/lib/utils";
import { useStore } from "@/hooks/helpers/use-store";
import { useSidebarToggle } from "@/hooks/helpers/use-sidebar-toggle";
import { Sidebar } from "./Sidebar";
import Footer from "./Footer";
import { CustomTourProvider } from "@/components/tour/TourProvider";

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const sidebar = useStore(useSidebarToggle, (state) => state);

  if (!sidebar) return null;

  const { isOpen } = sidebar;

  return (
    <CustomTourProvider>
      <Sidebar />

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
    </CustomTourProvider>
  );
}