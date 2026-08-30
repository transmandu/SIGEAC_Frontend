"use client";

import { cn } from "@/lib/utils";
import { useStore } from "@/hooks/helpers/use-store";
import { useSidebarToggle } from "@/hooks/helpers/use-sidebar-toggle";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import Footer from "./Footer";
import { CustomTourProvider } from "@/components/tour/TourProvider";
import { OnlineUsersProvider } from "@/contexts/OnlineUsersContext";
import { PageTitleProvider } from "@/contexts/PageTitleContext";
import CriticalAlertsButton from "./CriticalAlertsButton";
import BirthdayConfetti from "./BirthdayConfetti";

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const sidebar = useStore(useSidebarToggle, (state) => state);

  if (!sidebar) return null;

  const { isOpen } = sidebar;

  return (
    <OnlineUsersProvider>
      <CustomTourProvider>
        <PageTitleProvider>
          <Sidebar />

          <main
            className={cn(
              "min-h-[calc(100vh_-_56px)] transition-[margin-left] ease-in-out duration-300",
              isOpen === false ? "lg:ml-[90px]" : "lg:ml-72"
            )}
          >
            <Navbar />
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

          <CriticalAlertsButton />
          <BirthdayConfetti />
        </PageTitleProvider>
      </CustomTourProvider>
    </OnlineUsersProvider>
  );
}