"use client";

import { cn } from "@/lib/utils";
import { useSidebarToggle } from "@/hooks/helpers/use-sidebar-toggle";
import { useStoreHydrated } from "@/hooks/helpers/use-store";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import Footer from "./Footer";
import { CustomTourProvider } from "@/components/tour/TourProvider";
import { OnlineUsersProvider } from "@/contexts/OnlineUsersContext";
import { PageTitleProvider } from "@/contexts/PageTitleContext";
import CriticalAlertsButton from "./CriticalAlertsButton";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isOpen = useSidebarToggle((state) => state.isOpen);
  const hydrated = useStoreHydrated(useSidebarToggle);

  return (
    <OnlineUsersProvider>
      <CustomTourProvider>
        <PageTitleProvider>
          <Sidebar />

          <main
            className={cn(
              "min-h-[calc(100vh-56px)]",
              hydrated && "transition-[margin-left] ease-in-out duration-300",
              isOpen === false ? "lg:ml-22.5" : "lg:ml-72",
            )}
          >
            <Navbar />
            {children}
          </main>

          <footer
            className={cn(
              hydrated && "transition-[margin-left] ease-in-out duration-300",
              isOpen === false ? "lg:ml-22.5" : "lg:ml-72",
            )}
          >
            <Footer />
          </footer>

          <CriticalAlertsButton />
        </PageTitleProvider>
      </CustomTourProvider>
    </OnlineUsersProvider>
  );
}
